use std::fmt::{Display, Formatter, Result};

pub enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

impl Display for LogLevel {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        match self {
            LogLevel::Debug => write!(f, "debug"),
            LogLevel::Info => write!(f, "info"),
            LogLevel::Warn => write!(f, "warn"),
            LogLevel::Error => write!(f, "error"),
        }
    }
}
impl From<LogLevel> for String {
    fn from(level: LogLevel) -> Self {
        level.to_string()
    }
}

pub enum Source {
    Douyin,
    Tiktok,
    Bilibili,
}

impl Display for Source {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        match self {
            Source::Douyin => write!(f, "douyin"),
            Source::Tiktok => write!(f, "tiktok"),
            Source::Bilibili => write!(f, "bilibili"),
        }
    }
}

impl From<Source> for String {
    fn from(source: Source) -> Self {
        source.to_string()
    }
}
