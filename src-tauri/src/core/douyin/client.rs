pub use reqwest::{header, Method};

use crate::common::{error::CustomErr, Result};
use crate::config::CONFIG;

#[derive(Clone)]
pub struct Client(reqwest::Client);

impl Client {
    pub fn new() -> Self {
        let cfg = CONFIG.read().douyin.clone();
        let mut headers = header::HeaderMap::new();
        if let Ok(user_agent) = header::HeaderValue::from_str(cfg.headers.user_agent.as_str()) {
            headers.insert(header::USER_AGENT, user_agent);
        }
        if let Ok(referer) = header::HeaderValue::from_str(cfg.headers.referer.as_str()) {
            headers.insert(header::REFERER, referer);
        }

        let mut builder = reqwest::Client::builder();
        if !cfg.proxies.http.is_empty() {
            if let Ok(proxy) = reqwest::Proxy::all(&cfg.proxies.http) {
                builder = builder.proxy(proxy);
            } else {
                tracing::error!("Failed to build http proxy: {}", &cfg.proxies.http);
            }
        }
        if !cfg.proxies.https.is_empty() {
            if let Ok(proxy) = reqwest::Proxy::all(&cfg.proxies.https) {
                builder = builder.proxy(proxy);
            } else {
                tracing::error!("Failed to build https proxy: {}", &cfg.proxies.https);
            }
        }
        let client = builder
            .default_headers(headers)
            .gzip(true)
            .connect_timeout(std::time::Duration::from_secs(cfg.timeout))
            .read_timeout(std::time::Duration::from_secs(10))
            .build()
            .expect("Failed to build reqwest client");

        Self(client)
    }

    // a wrapper of reqwest::Client::request to add credential to the request
    pub fn request(&self, method: Method, url: &str) -> Result<reqwest::RequestBuilder> {
        let cookie = CONFIG.read().douyin.cookie.clone();
        if cookie.is_empty() {
            return Err(CustomErr::CookieIsEmpty);
        }
        let mut req = self.0.request(method, url);
        req = req.header(header::COOKIE, cookie.as_str());
        Ok(req)
    }
}

// clippy 建议实现 Default trait
impl Default for Client {
    fn default() -> Self {
        Self::new()
    }
}
