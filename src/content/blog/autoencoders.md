---
title: "What are Autoencoders?"
description: "A short note on autoencoders and why they matter in representation learning."
date: "2022-09-24"
draft: false
showHeroImage: false
categories:
  - Representation Learning
series:
  - Research
tags:
  - Machine Learning
  - Autoencoders
  - Variational Autoencoders
comments: false
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

Autoencoders are neural networks trained to reconstruct their input.

The basic idea is simple take some data, compress it into a smaller internal representation, and then try to reconstruct the original data from that compressed version. During this process, the model is forced to learn useful patterns about the input.

This makes autoencoders an important idea in representation learning.
They show how a model can learn meaningful features without needing manually labeled data.

## The Core Idea

An autoencoder has two main parts an **encoder** and a **decoder**.

The encoder takes the input and maps it into a latent representation. This latent representation is usually smaller, compressed, or more constrained than the original input. The decoder then takes this latent representation and tries to reconstruct the original input from it.

```
Input → Encoder → Latent Representation → Decoder → Reconstructed Input
```

The latent representation is the most interesting part of an autoencoder. It acts like a compressed summary of the input. If the model is trained well, this summary should preserve the most important information needed to reconstruct the original data.

## Why Compression Matters

If the latent representation has the same capacity as the input, the model may simply learn to copy the data. That is not very useful.

The important part is the bottleneck. By forcing the model to pass information through a smaller or more restricted latent space, we encourage it to learn structure in the data.

For example, in images, the model may learn information about edges, shapes, textures, and object-like patterns. It may not store every pixel directly, but it can learn enough structure to recreate something close to the original image.

This is why autoencoders are useful for learning representations. The model learns features from the data itself, instead of relying on external labels.

## Reconstruction Loss

Autoencoders are trained using reconstruction loss.

The model receives an input, produces a reconstructed output, and then compares the reconstruction with the original input. If the reconstruction is very different, the loss is high. If the reconstruction is close to the input, the loss is low.

For image data, common reconstruction losses include mean squared error or binary cross-entropy, depending on how the input is represented. The exact loss function can change, but the goal remains the same to make the reconstructed output as close as possible to the original input using the bottleneck.

This training objective gives the model a clear signal.
It learns to encode the input in a way that keeps the important information and removes unnecessary details.

## What Autoencoders Are Used For

Autoencoders have been used in many areas of machine learning.

They can be used for dimensionality reduction, where high-dimensional data is mapped into a smaller latent space. They can also be used for denoising, where the model learns to reconstruct a clean version of corrupted input.

Another common use case is anomaly detection. If an autoencoder is trained mostly on normal examples, it usually reconstructs normal data well. But when it sees unusual or out-of-distribution data, the reconstruction may be poor. A high reconstruction error can then act as a signal for anomaly detection.

Autoencoders are also useful for understanding latent spaces, compression, and generative modeling ideas.

## Where VAEs Fit

Variational Autoencoders, or VAEs, extend the basic autoencoder idea.

A regular autoencoder maps an input to a fixed latent vector. A VAE instead maps the input to a probability distribution in latent space. The model then samples from this distribution and uses the decoder to reconstruct the input.

This makes the latent space smoother and more structured. Instead of only learning how to reconstruct examples, a VAE learns a latent space that can be sampled from. This allows it to generate new examples that are similar to the training data.

In simple terms, a regular autoencoder learns compact representations for reconstruction. A VAE adds a probabilistic structure to the latent space, making it useful for generation.

## Use cases of Autoencoders

Autoencoders are not always the most powerful representation learning method today, especially compared to modern self-supervised learning and large generative models. But they are still important conceptually.

They introduce several ideas that appear again and again in deep learning: encoders, decoders, latent spaces, compression, reconstruction objectives, and generative modeling.

For that reason, autoencoders are a good starting point for understanding how neural networks can learn useful internal representations from data.
