---
title: "Introduction to Parallel Programming"
description: "Why GPU is needed?"
date: "2022-10-22"
draft: false
showHeroImage: false
categories:
  - ML Systems
series:
  - GPU
tags:
  - Parallel Programming
  - Efficiency
comments: false
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

Modern machine learning, graphics, simulations, and data processing workloads are expensive because they involve a huge number of repeated operations. A model may need to multiply millions of numbers, process thousands of pixels, or run the same computation across large batches of data.

Doing this one step at a time is slow. Parallel programming matters because it lets us express work in a way where many operations can happen at the same time.

## Why Parallel Programming Matters

A CPU is very good at handling complex control flow, branching logic, operating system tasks, and general-purpose computation.
But many performance heavy workloads are not complex in that way. They are repetitive.

For example:

```
apply the same operation to every pixel
multiply large matrices
compute activations for every token
run the same kernel across many data points
```

These are exactly the kinds of problems where parallel programming becomes useful. Instead of thinking only in terms of one instruction after another, we start thinking in terms of many small workers doing similar work together.

## GPU Execution Basics

A GPU is designed around massive parallelism. It has many lightweight execution units that can run thousands of small pieces of work concurrently.

The basic idea is simple split a large problem into many independent pieces and process them individually.

For example, instead of one loop processing every element in an array, each GPU thread can process one element:

```
CPU thinking:
for each item:
process item

GPU thinking:
many threads:
each thread processes one item
```

This shift in thinking is the core of GPU programming. The challenge is not only writing code that runs on the GPU, but writing code that keeps the GPU busy, avoids unnecessary memory movement, and uses hardware efficiently.

## Where CUDA Fits

CUDA is NVIDIA’s programming model for writing code that runs on NVIDIA GPUs. It gives developers a way to define GPU functions, called kernels, and launch them across many threads.

A CUDA kernel is usually written for one small unit of work. The GPU then runs that kernel across many threads arranged into blocks and grids.

At a high level:

```
Kernel = function that runs on GPU
Thread = one worker running the kernel
Block = group of threads
Grid = group of blocks
```

CUDA makes this structure explicit. It lets you control how work is distributed, how memory is accessed, and how different threads cooperate.

### Performance-Oriented Thinking

GPU programming is not just about moving code from CPU to GPU. Bad GPU code can still be slow.

The performance mindset is different. You start asking questions like:

- Is there enough parallel work?
- Are memory accesses efficient?
- Are threads doing similar work, or branching too much?
- Are we using the right level of abstraction?

In many real systems, performance is limited not by computation, but by level of abstraction.

It is essential to know when to break things for individual parallel usage and when we sequential thinking is required.

Reading and writing data can become more expensive than the math itself. This is why GPU programming often focuses heavily on memory layout, batching and avoiding redundant transfers.

## Next things

Parallel programming with GPUs is about learning to think in terms of computation shape.
Instead of asking only “what should the program do?”, we also ask “how can this work be divided across thousands of workers efficiently?”

I’m using the [HPC GPU Programming by IITM](https://www.youtube.com/watch?v=wFlejBXX9Gk&list=PL3xCBlatwrsXCGW4SfEoLzKiMSUCE7S_X) as a practical starting point to understand GPU architecture, CUDA programming, and the performance considerations behind real GPU workloads.
