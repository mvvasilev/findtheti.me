use chrono::NaiveDateTime;

#[derive(Clone)]
pub(crate) struct Availability {
    pub id: i64,
    pub event_id: i64,
    pub from_date: NaiveDateTime,
    pub to_date: NaiveDateTime,
    pub user_email: Option<String>,
    pub user_ip: String,
    pub user_name: String,
}
