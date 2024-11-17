use reqwest::header::{self, HeaderMap};

const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0";

pub fn get_headers(cookie: &str) -> HeaderMap {
    let mut headers = HeaderMap::new();
    // headers.insert(header::CONTENT_TYPE, "application/json".parse().unwrap());
    headers.insert(header::USER_AGENT, USER_AGENT.parse().unwrap());
    headers.insert(header::REFERER, "https://www.douyin.com/".parse().unwrap());
    headers.insert(header::COOKIE, cookie.parse().unwrap());
    headers
}

pub fn get_ies_headers() -> HeaderMap {
    let mut headers = HeaderMap::new();
    headers.insert("authority", "www.iesdouyin.com".parse().unwrap());
    headers.insert(header::USER_AGENT, USER_AGENT.parse().unwrap());
    headers.insert(header::ACCEPT, "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7".parse().unwrap());
    headers.insert(
        header::ACCEPT_LANGUAGE,
        "zh-CN,zh;q=0.9,en;q=0.8".parse().unwrap(),
    );
    headers.insert(header::CACHE_CONTROL, "max-age=0".parse().unwrap());
    headers.insert(
        "Sec-Ch-Ua",
        r#""Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120""#
            .parse()
            .unwrap(),
    );
    headers.insert("Sec-Ch-Ua-Mobile", "?0".parse().unwrap());
    headers.insert("Sec-Ch-Ua-Platform", r#""macOS""#.parse().unwrap());
    headers.insert("Sec-Fetch-Dest", "document".parse().unwrap());
    headers.insert("Sec-Fetch-Mode", "navigate".parse().unwrap());
    headers.insert("Sec-Fetch-Site", "none".parse().unwrap());
    headers.insert("Sec-Fetch-User", "?1".parse().unwrap());
    headers.insert(header::UPGRADE_INSECURE_REQUESTS, "1".parse().unwrap());
    headers
}
