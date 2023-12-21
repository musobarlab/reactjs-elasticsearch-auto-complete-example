import os
import tensorflow as tf
from pathlib import Path
from transformers import (
    GPT2Config, 
    TFGPT2LMHeadModel, 
    GPT2Tokenizer,
    WEIGHTS_NAME,
    CONFIG_NAME
)


# https://huggingface.co/learn/nlp-course/chapter6/8?fw=pt#building-a-bpe-tokenizer-from-scratch
if __name__ == '__main__':
    lang = 'id'

    base_path = os.getcwd()
    tokenized_data_path = os.path.join(base_path, 'tokenized_data')

    store_path = os.path.join(base_path, '{}_corpus'.format(lang))
    paths = [str(x) for x in Path(store_path).glob("*.txt")]

    # loading tokenizer from the saved model path
    tokenizer = GPT2Tokenizer.from_pretrained(tokenized_data_path)
    tokenizer.add_special_tokens({
        "eos_token": "<|endoftext|>",
        "bos_token": "<|endoftext|>",
    #    "unk_token": "<unk>",
    #    "pad_token": "<pad>",
    #    "mask_token": "<mask>"
    })

    # creating the configurations from which the model can be made
    config = GPT2Config(
        vocab_size=tokenizer.vocab_size,
        bos_token_id=tokenizer.bos_token_id,
        eos_token_id=tokenizer.eos_token_id
    )

    # creating the model
    model = TFGPT2LMHeadModel(config)

    single_string = ''
    for filename in paths:
        with open(filename, "r", encoding='utf-8') as f:
            x = f.read()
            single_string += x + tokenizer.eos_token
    string_tokenized = tokenizer.encode(single_string)

    examples = []
    block_size = 100
    BATCH_SIZE = 12
    BUFFER_SIZE = 1000
    for i in range(0, len(string_tokenized) - block_size + 1, block_size):
        examples.append(string_tokenized[i:i + block_size])

    inputs, labels = [], []
    for ex in examples:
        inputs.append(ex[:-1])
        labels.append(ex[1:])

    dataset = tf.data.Dataset.from_tensor_slices((inputs, labels))
    dataset = dataset.shuffle(BUFFER_SIZE).batch(BATCH_SIZE, drop_remainder=True)

    # defining our optimizer
    optimizer = tf.keras.optimizers.Adam(learning_rate=3e-5, epsilon=1e-08, clipnorm=1.0)
    # definining our loss function
    loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True)
    # defining our metric which we want to observe
    metric = tf.keras.metrics.SparseCategoricalAccuracy('accuracy')
    # compiling the model
    model.compile(optimizer=optimizer, loss=[loss, *[None] * model.config.n_layer], metrics=[metric])

    num_epoch = 10
    history = model.fit(dataset, epochs=num_epoch)

    text = "apa kamu tau tentang kota Bandung ? "
    # encoding the input text
    input_ids = tokenizer.encode(text, return_tensors='tf')
    # getting out output
    beam_output = model.generate(
        input_ids,
        max_length = 50,
        num_beams = 5,
        temperature = 0.7,
        no_repeat_ngram_size=2,
        num_return_sequences=5
    )

    print(tokenizer.decode(beam_output[0]))

    # save model
    output_dir = './model_bn_custom/'
    # creating directory if it is not present
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)
    model_to_save = model.module if hasattr(model, 'module') else model
    output_model_file = os.path.join(output_dir, WEIGHTS_NAME)
    output_config_file = os.path.join(output_dir, CONFIG_NAME)
    # save model and model configs
    model.save_pretrained(output_dir)
    model_to_save.config.to_json_file(output_config_file)
    # save tokenizer
    tokenizer.save_pretrained(output_dir)
