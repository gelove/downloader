use reqwest::Client;

use crate::common::{date, error::CustomErr, Result};
use crate::config::{MsToken, Proxies, Ttwid, WebId, CONFIG};

pub struct TokenManager {
    pub client: Client,
    pub token_cfg: MsToken,
    pub ttwid_cfg: Ttwid,
    pub webid_cfg: WebId,
    pub proxies: Proxies,
    pub user_agent: String,
}

impl Default for TokenManager {
    fn default() -> Self {
        let cfg = CONFIG.read();
        Self::new(
            cfg.douyin.ms_token.clone(),
            cfg.douyin.ttwid.clone(),
            cfg.douyin.webid.clone(),
            cfg.douyin.proxies.clone(),
            cfg.douyin.headers.user_agent.clone(),
        )
    }
}

impl TokenManager {
    pub fn new(
        token_cfg: MsToken,
        ttwid_cfg: Ttwid,
        webid_cfg: WebId,
        proxies: Proxies,
        user_agent: String,
    ) -> Self {
        let mut builder = Client::builder();
        if !proxies.http.is_empty() {
            if let Ok(proxy) = reqwest::Proxy::all(&proxies.http) {
                builder = builder.proxy(proxy);
            } else {
                tracing::error!("Failed to build http proxy: {}", &proxies.http);
            }
        }
        if !proxies.https.is_empty() {
            if let Ok(proxy) = reqwest::Proxy::all(&proxies.https) {
                builder = builder.proxy(proxy);
            } else {
                tracing::error!("Failed to build https proxy: {}", &proxies.https);
            }
        }
        let client = match builder.build() {
            Ok(client) => client,
            Err(e) => {
                tracing::error!(?e, "Failed to build client:");
                Client::new()
            }
        };
        TokenManager {
            client,
            token_cfg,
            ttwid_cfg,
            webid_cfg,
            proxies,
            user_agent,
        }
    }

    pub async fn gen_real_ms_token(&self) -> Result<String> {
        let payload = serde_json::json!({
            "magic": self.token_cfg.magic,
            "version": self.token_cfg.version,
            "dataType": self.token_cfg.data_type,
            "strData": self.token_cfg.str_data,
            "tspFromClient": date::timestamp_ms(),
        });

        let response = self
            .client
            .post(&self.token_cfg.url)
            .json(&payload)
            .header("Content-Type", "application/json; charset=utf-8")
            .header("User-Agent", &self.user_agent)
            .send()
            .await?;

        if response.status().is_success() {
            let cookies = response.cookies();
            let ms_token = cookies
                .filter(|cookie| cookie.name() == "msToken")
                .map(|cookie| cookie.value().to_string())
                .next()
                .ok_or(CustomErr::MsTokenError)?;
            Ok(ms_token)
        } else {
            Err(CustomErr::ResponseError)
        }
    }

    pub fn gen_false_ms_token(&self) -> String {
        let false_ms_token = format!("{}==", gen_random_str(126));
        println!("生成虚假的 msToken：{}", false_ms_token);
        false_ms_token
    }

    pub async fn gen_ttwid(&self) -> Result<String> {
        let response = self
            .client
            .post(&self.ttwid_cfg.url)
            .body(self.ttwid_cfg.data.clone())
            .header("Content-Type", "application/json; charset=utf-8")
            .header("User-Agent", &self.user_agent)
            .send()
            .await?;

        if response.status().is_success() {
            let cookies = response.cookies();
            let ttwid = cookies
                .filter(|cookie| cookie.name() == "ttwid")
                .map(|cookie| cookie.value().to_string())
                .next()
                .ok_or(CustomErr::TtwidError)?;

            Ok(ttwid)
        } else {
            Err(CustomErr::ResponseError)
        }
    }

    pub async fn gen_webid(&self) -> Result<String> {
        let body = serde_json::to_string(&self.webid_cfg.body).unwrap_or_default();

        let response = self
            .client
            .post(&self.webid_cfg.url)
            .body(body)
            .header("Content-Type", "application/json; charset=utf-8")
            .header("User-Agent", &self.user_agent)
            .send()
            .await?;

        if response.status().is_success() {
            let webid: String = response.json().await?;
            if webid.is_empty() {
                return Err(CustomErr::WebidError);
            }
            Ok(webid)
        } else {
            Err(CustomErr::ResponseError)
        }
    }
}

fn gen_random_str(len: usize) -> String {
    use rand::Rng;
    let charset: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-";
    let mut rng = rand::thread_rng();

    (0..len)
        .map(|_| {
            let idx = rng.gen_range(0..charset.len());
            charset[idx] as char
        })
        .collect()
}
