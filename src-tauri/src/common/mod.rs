pub mod date;
pub mod error;
pub mod file;
pub mod filename;
pub mod header;
pub mod md5;
pub mod media;
pub mod sm3;
pub mod vo;
// pub mod run_js;

// pub type Result<T> = std::result::Result<T, Box<dyn std::error::Error>>;
pub type Result<T> = std::result::Result<T, error::CustomErr>;
