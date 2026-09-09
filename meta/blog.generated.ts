// Generated from content/blog. Edit the writing files, then run npm run blog:sync.
import type { BlogMetadata, BlogSeries } from '@/types/blog.type';

export const blogMetadata: Record<string, BlogMetadata> = {
    "busy-waiting": {
        "title": "Busy-Waiting: When Doing Nothing Uses Everything",
        "summary": "Why a thread can do no useful work and still consume an entire CPU core — and how condition variables replace repeated polling with an efficient sleep-and-wake protocol.",
        "publishedOn": "2026-08-25T12:00:00.000Z",
        "year": "2026",
        "slug": "busy-waiting",
        "tags": [
            "concurrency",
            "operating-systems",
            "go",
            "synchronization"
        ],
        "status": "done",
        "coverImage": {
            "src": "/image/busy-waiting-cover.webp",
            "alt": "Network cables connected to rows of servers in a data centre"
        }
    },
    "cpu-pipelining": {
        "title": "CPU Pipelining, Explained with Robots",
        "summary": "A visual explanation of how a CPU overlaps fetch, decode, and execute so that one instruction can finish on almost every clock tick.",
        "publishedOn": "2026-08-26T09:00:00.000Z",
        "year": "2026",
        "slug": "cpu-pipelining",
        "tags": [
            "computer-architecture",
            "cpu",
            "pipelining",
            "performance"
        ],
        "status": "done",
        "coverImage": {
            "src": "/image/cpu-pipelining-cover.webp",
            "alt": "Industrial robots working along an automated factory conveyor"
        }
    },
    "dns": {
        "title": "Domain Name System (DNS)",
        "summary": "What is actually on the wire: the header, label encoding and compression pointers, walking from root to authoritative, the 512-byte limit, and why TTLs are how long your mistakes last. Built as a resolver in Go.",
        "publishedOn": "2025-10-27T19:16:03",
        "year": "2025",
        "slug": "dns",
        "tags": [
            "dns",
            "go",
            "networking",
            "protocols"
        ],
        "status": "in-progress"
    },
    "log/part-1-introduction": {
        "title": "Understanding Log: Introduction",
        "summary": "What a log is and why an ordered history of events is useful.",
        "publishedOn": "2026-09-03T00:00:00.000Z",
        "year": "2026",
        "slug": "log/part-1-introduction",
        "tags": [
            "logs",
            "databases",
            "version-control",
            "distributed-systems"
        ],
        "status": "done",
        "coverImage": {
            "src": "/image/log-in-several-systems.png",
            "alt": "Handwritten map connecting logs to databases, version control, and distributed systems"
        },
        "series": "log",
        "part": 1
    },
    "log/part-2-databases": {
        "title": "Understanding Log: Databases",
        "summary": "How databases use logs to record changes and recover their state.",
        "publishedOn": "2026-09-03T00:00:00.000Z",
        "year": "2026",
        "slug": "log/part-2-databases",
        "tags": [
            "logs",
            "databases"
        ],
        "status": "done",
        "coverImage": {
            "src": "/image/journey-of-a-write.jpeg",
            "alt": "Handwritten diagram tracing a write request from a client to the database"
        },
        "series": "log",
        "part": 2
    },
    "log/part-3-version-control": {
        "title": "Understanding Log: Version Control",
        "summary": "How version control records and navigates the history of changes.",
        "publishedOn": "2026-09-03T00:00:00.000Z",
        "year": "2026",
        "slug": "log/part-3-version-control",
        "tags": [
            "logs",
            "version-control"
        ],
        "status": "draft",
        "series": "log",
        "part": 3
    },
    "log/part-4-distributed-systems": {
        "title": "Understanding Log: Distributed Systems",
        "summary": "How logs help distributed systems replicate and coordinate changes.",
        "publishedOn": "2026-09-03T00:00:00.000Z",
        "year": "2026",
        "slug": "log/part-4-distributed-systems",
        "tags": [
            "logs",
            "distributed-systems"
        ],
        "status": "draft",
        "series": "log",
        "part": 4
    },
    "log/part-5-consensus-algorithms": {
        "title": "Understanding Log: Consensus",
        "summary": "Distributed Logs: view-stamped replication",
        "publishedOn": "2026-09-03T00:00:00.000Z",
        "year": "2026",
        "slug": "log/part-5-consensus-algorithms",
        "tags": [
            "logs",
            "distributed-systems"
        ],
        "status": "draft",
        "series": "log",
        "part": 5
    },
    "raft": {
        "title": "Raft",
        "summary": "Raft",
        "publishedOn": "2025-10-06T02:10:44",
        "year": "2025",
        "slug": "raft",
        "tags": [
            "distributed-systems",
            "consensus",
            "go",
            "raft"
        ],
        "status": "draft"
    },
    "SNA": {
        "title": "Shared-nothing-architecture",
        "summary": "SNA",
        "publishedOn": "2026-04-06T21:03:05.177Z",
        "year": "2026",
        "slug": "SNA",
        "tags": [
            "db",
            "distributed-systems",
            "disk",
            "memory"
        ],
        "status": "draft"
    }
};

export const blogSeries: Record<string, BlogSeries> = {
    "log": {
        "title": "Understanding Log",
        "summary": "A four-part series exploring logs, from the basic idea to databases, version control, and distributed systems.",
        "publishedOn": "2026-09-03T00:00:00.000Z",
        "year": "2026",
        "slug": "log",
        "tags": [
            "logs",
            "databases",
            "version-control",
            "distributed-systems"
        ],
        "status": "in-progress",
        "parts": [
            "log/part-1-introduction",
            "log/part-2-databases",
            "log/part-3-version-control",
            "log/part-4-distributed-systems",
            "log/part-5-consensus-algorithms"
        ],
        "partCount": 5,
        "publishedParts": 2
    }
};
