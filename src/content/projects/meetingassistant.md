---
title: "MeetingAssistant"
description: "Turning Meeting Transcripts into Action Items"
date: "2023-07-01"
draft: false
showHeroImage: false
tags:
  - NLP
  - Information Extraction
  - Flan-T5
comments: false
sidebar:
  enable: true
  toc: true
  relatedPosts: false
---

Meetings often contain a lot of useful information, but the actual follow ups are usually hidden inside long conversations. A transcript may include decisions, task assignments, casual acknowledgements, context, clarifications, and unrelated discussion all mixed together. The useful part is not just the transcript itself, but the ability to convert it into something operational.

[MeetingAssistant](https://github.com/Cyber-Machine/MeetingAssistant) is an NLP project focused on turning structured meeting transcripts into clean action item records. Instead of treating meeting notes as plain text, it extracts the parts that matter for follow up:

- the action to be done
- the likely assignee
- timestamp where the action item appears.

## Motivation

Most meeting transcripts are useful only after someone manually reviews them. That review step is slow and inconsistent.
People may miss follow ups, write incomplete notes, or fail to capture who owns a task.

The idea behind MeetingAssistant is simple: a meeting transcript should not just describe what happened. It should help people act on what was discussed.

The system takes transcript style data containing speaker names, timestamps, and dialogue, then maps it into structured output.

For example, a sentence like “Alice, can you take the UX bug?” should become a record such as:

```json
{
  "text": "UX bug",
  "assignee": "Alice",
  "ts": "10:00:00"
}
```

If the transcript contains a follow up without a clear owner, the assignee can be marked as unknown. If the sentence is just general conversation, the system should avoid producing a false action item. The project’s original expected output format includes action text, assignee, and optionally the timestamp where the action item was detected.

## Dataset Design

A major part of the project was designing data that could teach the model the difference between actionable and non-actionable meeting statements.

I generated synthetic meeting style examples using templates, speaker names, timestamps, actionable tasks, and non-actionable statements. The goal was not only to create examples where a task is clearly assigned, but also to include cases where no action should be extracted.

This distinction matters because action item extraction is not just an entity extraction problem. The model has to understand intent. A statement like “fix the bug” is actionable, but a sentence like “thanks for informing about the meeting” should not become a task. The approach document explicitly separates actionable tasks from non actionable statements and shows how template variations can produce both positive and negative examples.

The generated dataset followed a transcript like structure with fields such as start time, end time, speaker, and text. Alongside the transcript rows, I also generated corresponding structured labels. This made the training setup closer to the final product behavior: raw meeting text goes in, structured action item output comes out.

### Structured Outputs

One design choice I liked in this project was making the target output JSON oriented from the beginning.

Instead of training the model to produce loose natural language summaries, the output format was designed around fields like text, assignee, and ts. This makes the result easier to parse, validate, store, and integrate into downstream systems.

That is important because a meeting assistant is only useful if its output can be used somewhere else. A structured action item can be shown in a UI, stored in a database, exported into a task tracker, or reviewed by a user. A plain paragraph summary is helpful, but it is harder to turn into a workflow.

## Modeling Approach

MeetingAssistant treats action item extraction as a sequence-to-sequence problem. The input is transcript text, and the output is a structured action item representation.

For the model, I used an instruction-tuned Flan-T5 model. This made sense because the problem can be framed naturally as an instruction following generation task i.e. given a transcript sentence or segment, generate the structured action item if one exists.

The project used a smaller Flan-T5 variant and PEFT based finetuning to keep the training process lightweight.

The training notebook shows the use of [`google/flan-t5-small`](https://huggingface.co/google/flan-t5-small), Hugging Face datasets, tokenizer utilities, and PEFT components such as LoRA finetuning.

This was a practical choice. For a project like this, the important part was not only model size, but whether the end to end pipeline could be built with data generation, preprocessing, training, inference, and structured output formatting.

### Why Not Just Use NER?

A simpler approach would have been to train a Named Entity Recognition model to identify people and tasks separately. But action item extraction is slightly more complex than that.

The system has to understand whether a sentence actually contains a follow up. It also has to connect the task with the right person when possible. A name appearing near a task does not always mean that person is responsible for it.

Because of that, a sequence-to-sequence (S2S) model was a better fit. It allowed the model to directly generate the desired structured output rather than relying on multiple separate steps and handwritten rules. The approach document mentions that an NER based approach was considered but not chosen because correlating people and tasks reliably would add complexity and uncertainty.

### Limitations

The project is still a POC style system, and there are clear limitations.

The data is synthetic and template driven, so the model may learn patterns that do not fully cover messy real world meetings. Real meetings contain interruptions, vague references, incomplete sentences, topic shifts, and implicit ownership. A production version would need more diverse real transcript data and stronger evaluation.

The current setup also depends on English examples and may struggle with non-English names, domain specific terms, or inputs that differ too much from the training templates. The approach document notes limitations around model size, training data size, English only behavior, tokenizer unknowns, and template aligned outputs.

## Project Takeaways

This project was useful because it combined multiple parts of an applied NLP pipeline. It was not only about finetuning a model, but also about thinking through data generation, label design, structured supervision, model choice, inference format, and downstream usability.

The most interesting part was the product framing. A transcript by itself is not the final output. The more useful output is a clean list of followups that someone can review, store, or act on directly.

## Future Direction

A stronger version of MeetingAssistant could move beyond transcript to JSON extraction and become part of a larger productivity workflow. The extracted action items could be connected to calendars, task trackers, CRMs, or internal project management tools.

There is also room to improve the system with real meeting data, better handling of vague assignments, multiturn context, and stronger evaluation. Even in its current form, the project explores a practical idea of converting conversation into structured follow up records that are easier to use than raw meeting notes.
