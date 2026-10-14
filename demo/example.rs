/* A block comment. */

use std::collections::HashMap;

#[derive(Debug)]

pub struct Counter {
    total: u32,
    tags: HashMap<String, &'static str>,
}

impl Counter {
    pub fn tally(&mut self, label: &str, step: f64) -> u32 {
        let enabled = true;
        let ratio = 1.5;
        println!("{} {}", label, step);
        self.total += 1;
        42
    }
}
