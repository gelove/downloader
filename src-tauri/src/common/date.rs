use chrono::Utc;

// #[allow(dead_code)]
pub fn timestamp() -> i64 {
    Utc::now().timestamp()
}

pub fn timestamp_ms() -> i64 {
    Utc::now().timestamp_millis()
}

pub fn timestamp_us() -> i64 {
    Utc::now().timestamp_micros()
}

pub fn yesterday() -> i64 {
    Utc::now().timestamp() - 24 * 60 * 60
}

pub fn yesterday_ms() -> i64 {
    Utc::now().timestamp_millis() - 24 * 60 * 60 * 1000
}

pub fn yesterday_us() -> i64 {
    Utc::now().timestamp_micros() - 24 * 60 * 60 * 1000 * 1000
}

pub fn tomorrow() -> i64 {
    Utc::now().timestamp() + 24 * 60 * 60
}

pub fn tomorrow_ms() -> i64 {
    Utc::now().timestamp_millis() + 24 * 60 * 60 * 1000
}

pub fn tomorrow_us() -> i64 {
    Utc::now().timestamp_micros() + 24 * 60 * 60 * 1000 * 1000
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_timestamp() {
        assert!(timestamp() > 0);
    }

    #[test]
    fn test_timestamp_ms() {
        assert!(timestamp_ms() > 0);
    }

    #[test]
    fn test_timestamp_us() {
        assert!(timestamp_us() > 0);
    }

    #[test]
    fn test_yesterday() {
        assert!(yesterday() > 0);
    }

    #[test]
    fn test_yesterday_ms() {
        assert!(yesterday_ms() > 0);
    }

    #[test]
    fn test_yesterday_us() {
        assert!(yesterday_us() > 0);
    }

    #[test]
    fn test_tomorrow() {
        assert!(tomorrow() > 0);
    }

    #[test]
    fn test_tomorrow_ms() {
        assert!(tomorrow_ms() > 0);
    }

    #[test]
    fn test_tomorrow_us() {
        assert!(tomorrow_us() > 0);
    }
}
