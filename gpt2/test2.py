from transformers import (
    GPT2Tokenizer, TFGPT2Model
)

model_dir = './model_bn_custom/'

tokenizer = GPT2Tokenizer.from_pretrained(model_dir)
model = TFGPT2Model.from_pretrained(model_dir)
text = "cirebon sangat enak"
encoded_input = tokenizer(text, return_tensors='tf')
output = model(encoded_input)
# print(output)
print(tokenizer.decode(output[0]))