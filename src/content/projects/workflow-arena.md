---
title: "Workflow-Arena"
description: "A deterministic RL benchmark for DAG-based workflow scheduling under real operational constraints."
date: "2026-05-27"
draft: false
showHeroImage: false
tags:
  - Reinforcement Learning
  - Benchmarking
  - Scheduling
comments: false
sidebar:
  enable: false
  toc: true
  relatedPosts: false
---

Workflow-Arena is a deterministic reinforcement learning benchmark designed to evaluate LLM and RL agents on workflow scheduling problems that feel operational rather than toy-like.

The benchmark models DAG-based workflows with worker limits, deadlines, task priorities, failures, and retries, so policies have to make tradeoffs under pressure.

Key design points:

- dispatch and wait actions with explicit scheduling consequences
- dependency constraints and workflow ordering
- critical-path and slack-oriented signals
- difficulty-scaled scenarios that increase pressure without changing the basic interface
- reward shaping with penalties for invalid actions, avoidable waiting, over-capacity dispatches, missed deadlines, and unfinished tasks

The goal is to make agent evaluation more robust by reducing easy reward-hacking paths and forcing policies to reason about constrained execution.
