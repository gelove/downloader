use serde::{ser::Serializer, Serialize};

// 统一处理错误，统一返回错误信息
// 两种方案: 接口统一返回 CustomErr 或者 统一返回 anyhow::Error
// 统一返回 CustomErr, 需要通过 #[from] 将所有第三方错误转为 CustomErr
#[repr(u16)]
#[derive(thiserror::Error, Debug)]
pub enum CustomErr {
    #[error("未知错误")]
    UnknownError = 1000,

    #[error("响应错误")]
    ResponseError,

    #[error("获取 msToken 错误")]
    MsTokenError,

    #[error("获取 ttwid 错误")]
    TtwidError,

    #[error("获取 webid 错误")]
    WebidError,

    #[error("窗口未找到")]
    WindowNotFound,

    #[error("视频数量为零")]
    VideoIsEmpty,

    #[error("uid 不能为空")]
    UidIsEmpty,

    #[error("cookie 不能为空")]
    CookieIsEmpty,

    #[error("响应体为空")]
    ResponseBodyIsEmpty,

    #[error("未授权")]
    Unauthorized,

    #[error("无效的token")]
    InvalidToken,

    #[error("不支持的媒体类型")]
    UnsupportedMediaType,

    #[error("无效的数据 (expected {expected:?}, found {found:?})")]
    InvalidData { expected: String, found: String },

    #[error("路径错误")]
    PathError(std::path::PathBuf),

    #[error("提取扩展名失败")]
    ExtensionError(std::path::PathBuf),

    #[error("提取文件名失败")]
    FileNameError(std::path::PathBuf),

    // 其他错误转为自定义错误 CustomErr::from(std::io::Error) => CustomErr::IoError(e)
    #[error("IO 错误")]
    // IoError {
    //     #[from]
    //     #[backtrace]
    //     source: std::io::Error,
    // },
    IoError(#[from] std::io::Error),

    #[error("无效 Cookie")]
    CookieError(#[from] reqwest::header::InvalidHeaderValue),

    #[error("Reqwest 网络请求错误")]
    ReqwestError(#[from] reqwest::Error),

    #[error("Json 解析错误")]
    SerdeJsonError(#[from] serde_json::Error),

    #[error("Json Urlencoded 错误")]
    SerdeUrlencodedError(#[from] serde_urlencoded::ser::Error),

    #[error("Toml 解析错误")]
    TomlDeError(#[from] toml::de::Error),

    #[error("WalkDir 错误")]
    WalkDirError(#[from] walkdir::Error),

    #[error("Tauri 错误")]
    TauriError(#[from] tauri::Error),
}

// https://doc.rust-lang.org/reference/items/enumerations.html#pointer-casting
impl CustomErr {
    pub fn discriminant(&self) -> u16 {
        unsafe { *(self as *const Self as *const u16) }
    }
}

// 必须实现 Serialize 接口，用于返回 tauri::command 返回自定义错误
// https://github.com/tauri-apps/tauri/discussions/3913
impl Serialize for CustomErr {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        tracing::error!("CustomErr: {:?}", self);
        serializer.serialize_str(self.to_string().as_ref())
    }
}
