import os
from transformers import (
    GPT2Config, 
    TFGPT2LMHeadModel, 
    GPT2Tokenizer,
    GPT2TokenizerFast,
    WEIGHTS_NAME,
    CONFIG_NAME
)

model_dir = './model_bn_custom/'
tokenizer = GPT2Tokenizer.from_pretrained(model_dir)
model = TFGPT2LMHeadModel.from_pretrained(model_dir)

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

text = "respon terhadap kejahatan seseorang"
# encoding the input text
input_ids = tokenizer.encode(text, return_tensors='tf')
print(input_ids)

print(tokenizer.decode(input_ids[0]))

# getting out output
beam_output = model.generate(
    input_ids,
    max_length = 50,
    num_beams = 5,
    temperature = 0.7,
    no_repeat_ngram_size=2,
    num_return_sequences=5
)

print(len(beam_output))
print(tokenizer.decode(beam_output[0]))
