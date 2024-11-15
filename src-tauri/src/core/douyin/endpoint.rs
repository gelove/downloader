// 抖音域名 (Douyin Domain)
pub const DOUYIN_DOMAIN: &'static str = "https://www.douyin.com";

// 抖音短域名 (Short Domain)
pub const IES_DOUYIN_DOMAIN: &'static str = "https://www.iesdouyin.com";

// 直播域名 (Live Domain)
pub const LIVE_DOMAIN: &'static str = "https://live.douyin.com";

// 直播域名2 (Live Domain 2)
pub const LIVE_DOMAIN2: &'static str = "https://webcast.amemv.com";

// SSO域名 (SSO Domain)
pub const SSO_DOMAIN: &'static str = "https://sso.douyin.com";

// WSS域名 (WSS Domain)
pub const WEBCAST_WSS_DOMAIN: &'static str = "wss://webcast5-ws-web-hl.douyin.com";

pub struct DouyinEndpoint;

impl DouyinEndpoint {
    // 直播弹幕(WSS) (Live Danmaku WSS)
    pub fn get_live_im_wss() -> String {
        format!("{}{}", WEBCAST_WSS_DOMAIN, "/webcast/im/push/v2/")
    }

    // 首页Feed (Home Feed)
    pub fn get_tab_feed() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/tab/feed/")
    }

    // 用户短信息 (User Short Info)
    pub fn get_user_short_info() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/im/user/info/")
    }

    // 用户详细信息 (User Detail Info)
    pub fn get_user_detail() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/user/profile/other/")
    }

    // 作品基本 (Post Basic)
    pub fn get_base_aweme() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/aweme/")
    }

    // 用户作品 (User Post)
    pub fn get_user_post() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/aweme/post/")
    }

    // 定位作品 (Post Local)
    pub fn get_locate_post() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/locate/post/")
    }

    // 搜索作品 (Post Search)
    pub fn get_post_search() -> String {
        format!(
            "{}{}",
            DOUYIN_DOMAIN, "/aweme/v1/web/general/search/single/"
        )
    }

    // 作品信息 (Post Detail)
    pub fn get_post_detail() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/aweme/detail/")
    }

    // 用户喜欢A (User Like A)
    pub fn get_user_favorite_a() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/aweme/favorite/")
    }

    // 用户喜欢B (User Like B)
    pub fn get_user_favorite_b() -> String {
        format!("{}{}", IES_DOUYIN_DOMAIN, "/web/api/v2/aweme/like/")
    }

    // 关注用户(User Following)
    pub fn get_user_following() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/user/following/list/")
    }

    // 粉丝用户 (User Follower)
    pub fn get_user_follower() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/user/follower/list/")
    }

    // 合集作品
    pub fn get_mix_aweme() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/mix/aweme/")
    }

    // 用户历史 (User History)
    pub fn get_user_history() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/history/read/")
    }

    // 用户收藏 (User Collection)
    pub fn get_user_collection() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/aweme/listcollection/")
    }

    // 用户收藏夹 (User Collects)
    pub fn get_user_collects() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/collects/list/")
    }

    // 用户收藏夹作品 (User Collects Posts)
    pub fn get_user_collects_video() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/collects/video/list/")
    }

    // 用户音乐收藏 (User Music Collection)
    pub fn get_user_music_collection() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/music/listcollection/")
    }

    // 首页朋友作品 (Friend Feed)
    pub fn get_friend_feed() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/familiar/feed/")
    }

    // 关注用户作品 (Follow Feed)
    pub fn get_follow_feed() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/follow/feed/")
    }

    // 相关推荐 (Related Feed)
    pub fn get_post_related() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/aweme/related/")
    }

    // 关注用户列表直播 (Follow User Live)
    pub fn get_follow_user_live() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/webcast/web/feed/follow/")
    }

    // 直播信息接口 (Live Info)
    pub fn get_live_info() -> String {
        format!("{}{}", LIVE_DOMAIN, "/webcast/room/web/enter/")
    }

    // 直播信息接口2 (Live Info 2)
    pub fn get_live_info_room_id() -> String {
        format!("{}{}", LIVE_DOMAIN2, "/webcast/room/reflow/info/")
    }

    // 直播用户信息 (Live User Info)
    pub fn get_live_user_info() -> String {
        format!("{}{}", LIVE_DOMAIN, "/webcast/user/me/")
    }

    // 直播弹幕初始化 (Live Danmaku Init)
    pub fn get_live_im_fetch() -> String {
        format!("{}{}", LIVE_DOMAIN, "/webcast/im/fetch/")
    }

    // 推荐搜索词 (Suggest Words)
    pub fn get_suggest_words() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/api/suggest_words/")
    }

    // SSO登录 (SSO Login)
    pub fn get_sso_login_get_qr() -> String {
        format!("{}{}", SSO_DOMAIN, "/get_qrcode/")
    }

    // 登录检查 (Login Check)
    pub fn get_sso_login_check_qr() -> String {
        format!("{}{}", SSO_DOMAIN, "/check_qrconnect/")
    }

    // 登录确认 (Login Confirm)
    pub fn get_sso_login_check_login() -> String {
        format!("{}{}", SSO_DOMAIN, "/check_login/")
    }

    // 登录重定向 (Login Redirect)
    pub fn get_sso_login_redirect() -> String {
        format!("{}{}", SSO_DOMAIN, "/login/")
    }

    // 登录回调 (Login Callback)
    pub fn get_sso_login_callback() -> String {
        format!("{}{}", SSO_DOMAIN, "/passport/sso/login/callback/")
    }

    // 作品评论 (Post Comment)
    pub fn get_post_comment() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/comment/list/")
    }

    // 回复评论 (Reply Comment)
    pub fn get_post_comment_publish() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/comment/publish")
    }

    // 删除评论 (Delete Comment)
    pub fn get_post_comment_delete() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/comment/delete/")
    }

    // 点赞评论 (Like Comment)
    pub fn get_post_comment_digg() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/comment/digg")
    }

    // 查询用户 (Query User)
    pub fn get_query_user() -> String {
        format!("{}{}", DOUYIN_DOMAIN, "/aweme/v1/web/query/user/")
    }
}
