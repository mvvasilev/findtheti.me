use std::fmt::Display;

use chrono::NaiveDateTime;

pub(crate) struct Event {
    pub id: i64,
    pub snowflake_id: String,
    pub name: String,
    pub description: Option<String>,
    pub from_date: Option<NaiveDateTime>,
    pub to_date: Option<NaiveDateTime>,
    pub event_type: EventType,
    pub duration: i32,
}

#[derive(Debug)]
pub(crate) enum EventType {
    SpecificDate,
    DateRange,
    Day,
    Week,
    Month,
    Unknown,
}

impl Display for EventType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl From<String> for EventType {
    fn from(val: String) -> Self {
        match val.as_str() {
            "SpecificDate" => EventType::SpecificDate,
            "DateRange" => EventType::DateRange,
            "Day" => EventType::Day,
            "Week" => EventType::Week,
            "Month" => EventType::Month,
            _ => EventType::Unknown,
        }
    }
}
