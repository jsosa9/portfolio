---
title: Building a Character-Level Tokenizer
date: 2026-07-26
commitUrl: https://github.com/jsosa9/llm-from-scratch/commit/cf994197b5803bbad9239f87a6db31f8b3bbdc4e
excerpt: Comparing BPE, word-level, and character-level tokenization, then building a character-level tokenizer from scratch with a hashmap-based vocab.
---

*These are my personal notes from Obsidian — they just go through my thought process and what I learned. This is really just documenting my learning. When I say "from scratch," I mean learning from documentation and YouTube videos, not using AI to help write the code.*

## 7/25/26

3 ways to do it:

### [BPE](https://huggingface.co/learn/llm-course/en/chapter6/5) — Byte Pair Encoding

- BPE is the most balanced and industry standard tokenization
- Byte pair meaning a character, so it starts with the phrase
- Once it has the user's phrase, it lists every word with the count of how many times it appears
- Then it takes all the phrases and separates them by letter, so each letter is a token for now
- Now we count the amount of each letter
- For the highest pair, we combine them into the individual letter version of the token, and then repeat

### Word Level

- Takes every single word as a token
- Fast, but makes it inaccurate. Fewer tokens, but because of situations like "played" vs "play" vs "player," definitions can be lost much easier

### Character Level

- Takes every single letter as a token
- Slow and generates a lot of tokens, but it makes it accurate

## Focus

Going to do a char level tokenizer, following [this article](https://www.shadecoder.com/topics/character-level-tokenization-a-comprehensive-guide-for-2025).

Steps:
- **Normalization** — making sure everything is consistent so we're able to process it
- **Defining the vocab** — using a hashset to get each character used (we don't care about count). This will help later, because once each letter becomes a number, it's easy to put it back into words since one letter doesn't have multiple different ids
- **Tokenize** — this is where we turn each letter into a number. This does the translation that's needed later on to actually generate responses to the user
- Then it's done, and this is the first step in the pipeline

### Normalization

I plan to just accept any kind of input.

I'll handle cases in the UI where users enter something like emojis, or if the LLM isn't going to take Greek letters or other languages, then I'll catch that when the user attempts to submit their input.

- Take in the input, check it
- Make everything lowercase to ensure consistency
- Put everything into an array of chars, where each char is isolated

### Defining the Vocab

I'll just take the array of letters split into chars from the previous step and turn it into a hashset. So this way we have the letter bank we're dealing with for this prompt.

Before tokenizing I have to define the vocabulary, because the tokenizer depends on the vocabulary, otherwise you'll have random numbers bound to random letters.

So every letter needs a unique id, and then after that you can encode everything, because every letter has a place.

## 7/26/26

We'll use a hashmap for each pair. From my understanding:

### Encoding / Decoding

- Each char will have an id
- We take the vocab from the prompt (the hashset) and check the data for what we have that matches
  - Once we find a match, it finds the id for the char
  - If we don't find a match, I'll have a function that adds the char to the hashmap and assigns it an id
- For decoding, we just take the hashmap for the encoding one and flip the key/value pairs
  - We can look up by value in the hashmap to get the key, but that's O(n), not O(1). Looking up by key to get the value is O(1)

The **encoder** literally just takes the char, not the vocab (which is a hashset), and returns the tokenized (id-assigned) version of it.

The **decoder** does the opposite: finds the number as a key and swaps it with the value, which is a letter.

## Finished Tokenizer — Learnings

- The first thing we do is make the vocab. This is what allows us to begin to encode or decode the input automatically
  - encoder k,v pairs: k = char, v = int id
  - decoder k,v pairs: k = id, v = char
- The class takes in the text input, from the user or data I tested with: `'the quick brown fox jumps over the lazy dog'` — and it worked. Encoding, then calling decode on that output, returned the original.

```python
class Tokenizer():
    def __init__(self, text):
        self.encoder_map = {} # dict
        self.decoder_map = {} # dict

        self.build_vocab(text)

    def normalization(self, input):
        normalization_outcome = input.lower()
        normalization_outcome = list(normalization_outcome)
        return normalization_outcome

    # job is to go through the input and make it into the hashmap dictionary for encoder and decoder
    def build_vocab(self, text):
        list_user_input = self.normalization(text)
        for c in list_user_input:
            # checks to see if we have the value in the hashmap. if so, does nothing. if not, makes the id for it
            self.encoder_map.setdefault(c, len(self.encoder_map) + 1)
            self.decoder_map.setdefault(self.encoder_map.get(c), c)

    def encoder(self, text):
        encoder_outcome = list()
        list_user_input = self.normalization(text)
        for c in list_user_input:
            encoder_outcome.append(self.encoder_map.get(c))
        return encoder_outcome

    def decoder(self, id):
        decoder_outcome = list()
        for n in id:
            decoder_outcome.append(self.decoder_map.get(n))
        return "".join(decoder_outcome)


t = Tokenizer("the quick brown fox jumps over the lazy dog")
t.decoder([1,2,3,4,5,6,7,8,9,4,10,11,12,13,14,4,15,12,16,4,17,6,18,19,20,4,12,21,3,11,4,1,2,3,4,22,23,24,25,4,26,12,27])
```

I also realized the encoder and decoder can't rely on one another:

```python
def encoder(self):
    encoder_outcome = list()
    list_user_input = self.normalization(self.user_input)
    for c in list_user_input:
        encoder_outcome.append(self.encoder_map.get(c))
    return encoder_outcome

def decoder(self, id):
    decoder_outcome = list()
    for n in id:
        decoder_outcome.append(self.decoder_map.get(self.encoder_map.get(c)))
    return "".join(decoder_outcome)
```

If you notice, the decoder here depends on the encoder, because I'm doing the opposite: the decoder map needs an int, so I'm fetching that int via the encoder map (by fetching the key, not the int itself directly). This approach makes them dependent on each other. If one is wrong, they're both wrong, and overall it's not as ideal.
