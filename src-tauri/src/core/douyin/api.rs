use std::fs::File;
use std::io::Write;
use std::path::Path;

use futures_util::StreamExt;

use super::a_bogus::{ABogus, BrowserFingerprintGenerator, BrowserType};
use super::client::{Client, Method};
use super::dto::{BaseDto, UserDto, VideosDto};
use super::endpoint::DouyinEndpoint;
use super::token::TokenManager;
use super::vo::{UserResp, Video, VideoResp};
use crate::common::{error::CustomErr, header, Result};
use crate::config::{Source, CONFIG};

// 封装闭包
pub struct CallBackClosure<F>(pub F);

// 实现 Display trait
impl<F> std::fmt::Debug for CallBackClosure<F>
where
    F: Fn(u64, u64) -> Result<()> + Send,
{
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        f.debug_struct("CallBackClosure").finish()
    }
}

impl<F> CallBackClosure<F>
where
    F: Fn(u64, u64) -> Result<()> + Send,
{
    pub fn call(&self, a: u64, b: u64) -> Result<()> {
        (self.0)(a, b)
    }
}

fn get_endpoint(api: &str, params: &str) -> String {
    let browser_fp = BrowserFingerprintGenerator::generate(BrowserType::Edge);
    let user_agent = CONFIG.read().douyin.headers.user_agent.clone();
    let ab = ABogus::new(Some(browser_fp), Some(user_agent));
    let (_, ab_value, _) = ab.generate_abogus(params, "");
    format!("{}?{}&a_bogus={}", api, params, ab_value)
}

async fn get_ms_token() -> String {
    let token_manager = TokenManager::default();
    token_manager
        .gen_real_ms_token()
        .await
        .unwrap_or_else(|_| token_manager.gen_false_ms_token())
}

async fn create_user_dto(sec_user_id: String) -> UserDto {
    let token = get_ms_token().await;
    let base_dto = BaseDto::new(token);
    UserDto::new(base_dto, sec_user_id)
}

async fn create_videos_dto(sec_user_id: String, count: u64, max_cursor: u64) -> VideosDto {
    let token = get_ms_token().await;
    let base_dto = BaseDto::new(token);
    VideosDto::new(base_dto, sec_user_id, count, max_cursor)
}

// 取用户信息
#[tracing::instrument]
pub async fn get_user(sec_user_id: &str) -> Result<UserResp> {
    // https://www.douyin.com/user/MS4wLjABAAAAB7geBosrrW1XPPqgd88hbbKF8fymijEvW5wTsq4qIK6mDkbb5Ycvl8_fxDrHCawy
    // let reg_get_user_id = Regex::new(r"https://www.douyin.com/user/([\w-]+)")?;
    // let uid = reg_get_user_id
    //     .captures(addr)
    //     .and_then(|captures| captures.get(1).map(|value| value.as_str()))
    //     .ok_or(CustomErr::Error))?;
    tracing::info!(?sec_user_id, "sec_user_id:");
    if sec_user_id.is_empty() {
        // return Err(CustomErr::UidIsEmpty)?;
        return Err(CustomErr::UidIsEmpty.into());
    }

    let user_dto = create_user_dto(sec_user_id.to_string()).await;
    let params = serde_urlencoded::to_string(&user_dto)?;
    let api = DouyinEndpoint::get_user_detail();
    let url = get_endpoint(&api, &params);
    let response = Client::new().request(Method::GET, &url)?.send().await?;
    if !response.status().is_success() {
        tracing::error!(status = ?response.status(), "get_user response status:");
        return Err(CustomErr::ResponseError)?;
    }
    let res_text = response.text().await?;
    // tracing::info!("get_user res_text => {:?}", res_text);
    let raw = serde_json::from_str::<serde_json::Value>(&res_text)?;
    // tracing::info!("raw => {:?}", raw);
    let status_code = raw["status_code"].as_u64().unwrap_or(0_u64);
    if status_code != 0 {
        let status_msg = raw["status_msg"].as_str().unwrap_or("");
        tracing::error!(?status_code, ?status_msg, "get_user:");
        return Err(CustomErr::ResponseError)?;
    }
    Ok(UserResp {
        uid: sec_user_id.into(),
        avatar: raw["user"]["avatar_larger"]["url_list"][0]
            .as_str()
            .unwrap_or("")
            .to_string(),
        nickname: raw["user"]["nickname"].as_str().unwrap_or("").to_string(),
        source: Source::Douyin.into(),
        video_count: raw["user"]["aweme_count"].as_u64().unwrap_or(0_u64),
    })
}

fn is_video(item: &serde_json::Value) -> bool {
    let list = [0_i64, 55, 61, 109, 201];
    let aweme_type = item["aweme_type"].as_i64().unwrap_or(-1_i64);
    list.contains(&aweme_type)
}

// 取用户下的所有个人视频
#[tracing::instrument]
pub async fn get_videos_by_uid(
    sec_user_id: &str,
    count: u64,
    max_cursor: u64,
) -> Result<VideoResp> {
    if sec_user_id.is_empty() {
        return Err(CustomErr::UidIsEmpty);
    }
    let videos_dto = create_videos_dto(sec_user_id.to_string(), count, max_cursor).await;
    // tracing::info!("{:?}", videos_dto);
    let params = serde_urlencoded::to_string(&videos_dto)?;
    // let params = format!("sec_user_id={sec_user_id}&count={count}&max_cursor={max_cursor}");
    let api = DouyinEndpoint::get_user_post();
    let url = get_endpoint(&api, &params);
    // tracing::info!("{url}");
    let response = Client::new().request(Method::GET, &url)?.send().await?;
    if !response.status().is_success() {
        tracing::error!(status = ?response.status(), "get_user response status:");
        return Err(CustomErr::ResponseError)?;
    }
    // tracing::info!("{:?}", response);
    let res_text = response.text().await?;
    if res_text.is_empty() {
        return Err(CustomErr::ResponseBodyIsEmpty);
    }

    let raw = serde_json::from_str::<serde_json::Value>(&res_text)?;
    // tracing::info!(?raw, "get_videos_by_uid:");
    let status_code = raw["status_code"].as_u64().unwrap_or(0_u64);
    if status_code != 0 {
        let status_msg = raw["status_msg"].as_str().unwrap_or("");
        tracing::error!(?status_code, ?status_msg, "get_videos_by_uid:");
        return Err(CustomErr::ResponseError);
    }

    let has_more = raw["has_more"].as_u64().unwrap_or(0_u64);
    let max_cursor = raw["max_cursor"].as_u64().unwrap_or(0_u64);
    let video_list = match raw["aweme_list"].as_array() {
        Some(array) => array,
        None => {
            return Err(CustomErr::VideoIsEmpty);
        }
    };

    let list = video_list
        .iter()
        .filter(|item| is_video(item))
        .map(|item| {
            let url = match item["bit_rate"].as_array() {
                Some(videos) => videos[0]["play_addr"]["url_list"][1]
                    .as_str()
                    .unwrap_or("")
                    .to_string(),
                None => item["video"]["play_addr"]["url_list"][1]
                    .as_str()
                    .unwrap_or("")
                    .to_string(),
            };
            // let url = url.replace("playwm", "play");
            Video {
                url,
                id: item["aweme_id"].as_str().unwrap_or("").to_string(),
                title: item["preview_title"].as_str().unwrap_or("").to_string(),
                desc: item["desc"].as_str().unwrap_or("").to_string(),
                ratio: item["video"]["ratio"].as_str().unwrap_or("").to_string(),
                cover: item["video"]["cover"]["url_list"][0]
                    .as_str()
                    .unwrap_or("")
                    .to_string(),
                nickname: item["author"]["nickname"]
                    .as_str()
                    .unwrap_or("")
                    .to_string(),
                is_top: item["is_top"].as_u64().unwrap_or(0_u64),
                likes: item["statistics"]["digg_count"].as_u64().unwrap_or(0_u64),
                duration: item["video"]["duration"].as_u64().unwrap_or(0_u64),
                total_count: item["author"]["aweme_count"].as_u64().unwrap_or(0_u64),
                create_time: item["create_time"].as_u64().unwrap_or(0_u64),
            }
        })
        .collect::<Vec<Video>>();
    tracing::info!(len = ?list.len(), "get_videos_by_uid:");

    Ok(VideoResp {
        list,
        has_more,
        max_cursor,
    })
}

// 取用户信息 无需cookie
#[tracing::instrument]
pub async fn get_user_by_ies(sec_user_id: &str) -> Result<UserResp> {
    if sec_user_id.is_empty() {
        return Err(CustomErr::UidIsEmpty);
    }
    let url = "https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid=".to_string() + sec_user_id;
    let client = reqwest::Client::new();
    let headers = header::get_ies_headers();
    // headers.values().for_each(|item| {
    //     println!("item => {:?}", item);
    // });
    let res_text = client
        .get(url)
        .headers(headers)
        .send()
        .await?
        .text()
        .await?;
    println!("res_text => {}", res_text);
    let raw = serde_json::from_str::<serde_json::Value>(&res_text)?;
    Ok(UserResp {
        uid: sec_user_id.into(),
        avatar: raw["user_info"]["avatar_medium"]["url_list"][0]
            .as_str()
            .unwrap_or("")
            .to_string(),
        nickname: raw["user_info"]["nickname"]
            .as_str()
            .unwrap_or("")
            .to_string(),
        source: Source::Douyin.into(),
        video_count: raw["user_info"]["aweme_count"].as_u64().unwrap_or(0_u64),
    })
}

/// 视频下载
#[tracing::instrument]
pub async fn download<F>(
    url: &str,
    title: &str,
    file_name: &str,
    save_path: &str,
    call_back: CallBackClosure<F>,
) -> Result<String>
where
    F: Fn(u64, u64) -> Result<()> + Send,
{
    let save_path = Path::new(save_path);
    if !save_path.exists() {
        std::fs::create_dir_all(save_path)?;
    }
    let filepath = save_path.join(file_name.replace(
        |item: char| ['\\', '/', ':', '?', '*', '"', '<', '>', '|'].contains(&item),
        "_",
    ));
    tracing::info!("Downloading video to filepath: {}", filepath.display());
    // 文件已存在
    if filepath.exists() {
        return Ok(filepath
            .to_str()
            .ok_or(CustomErr::PathError(filepath.to_path_buf()))?
            .into());
    }

    let res = Client::new().request(Method::GET, &url)?.send().await?;
    if !res.status().is_success() {
        tracing::error!(status = ?res.status(), "download response status:");
        return Err(CustomErr::ResponseError)?;
    }
    let res_len = res.content_length().unwrap_or(0);
    if res_len == 0 {
        return Err(CustomErr::VideoIsEmpty);
    }

    let mut downloaded_len = 0_u64;
    let mut stream = res.bytes_stream();
    let mut file = File::create(&filepath)?;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        file.write_all(&chunk)?;
        downloaded_len += chunk.len() as u64;

        call_back.call(downloaded_len, res_len)?;
    }

    // let title_path: std::path::PathBuf = Path::new(save_path).join("title.txt");
    // let mut f = File::create(&title_path)?;
    // f.write_all(title.as_bytes())?;

    let filepath = filepath
        .to_str()
        .ok_or(CustomErr::PathError(filepath.to_path_buf()))?
        .into();

    Ok(filepath)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_user() {
        crate::config::update(include_str!("../../../../config.toml"), None).unwrap();
        println!("config => {:?}", CONFIG.read().douyin.lyric);
        let res = get_user(
            "MS4wLjABAAAAB7geBosrrW1XPPqgd88hbbKF8fymijEvW5wTsq4qIK6mDkbb5Ycvl8_fxDrHCawy",
            // "MS4wLjABAAAAQzpOGmGoSULedid8vmOh7tbQUzIkVGgAD2HAAyewNpw",
            // "MS4wLjABAAAAf6Lm-c6eQYIPhWnQaalomsoP5uB-J2gAxg0SLLJnSZw",
        )
        .await
        .unwrap();
        println!("res => {:?}", res);
    }

    #[tokio::test]
    async fn test_get_videos_by_uid() {
        crate::config::update(include_str!("../../../../config.toml"), None).unwrap();
        println!("config => {:?}", CONFIG.read().douyin.lyric);
        let res = get_videos_by_uid(
            "MS4wLjABAAAAf6Lm-c6eQYIPhWnQaalomsoP5uB-J2gAxg0SLLJnSZw",
            20,
            0,
        )
        .await
        .unwrap();
        println!("res {:?} => {:?}", res.list.len(), res);
    }

    #[tokio::test]
    async fn test_get_user_by_ies() {
        let res = get_user_by_ies(
            "MS4wLjABAAAAB7geBosrrW1XPPqgd88hbbKF8fymijEvW5wTsq4qIK6mDkbb5Ycvl8_fxDrHCawy",
        )
        .await
        .unwrap();
        println!("res => {:?}", res);
    }
}
