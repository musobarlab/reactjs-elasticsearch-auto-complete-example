import os
from tokenizers import (
    decoders,
    normalizers,
    models,
    processors,
    pre_tokenizers,
    trainers,
    Tokenizer
)

from transformers import (
    GPT2TokenizerFast
)

class BPE_token(object):
    def __init__(self):
        self.tokenizer = Tokenizer(models.BPE())
        # self.tokenizer.normalizer = normalizers.Sequence([
        #     normalizers.NFKC()
        # ])
        self.tokenizer.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
        self.tokenizer.decoder = decoders.ByteLevel()

    def bpe_train(self, paths):
        trainer = trainers.BpeTrainer(
            vocab_size=50000, 
            show_progress=True, 
            # inital_alphabet=pre_tokenizers.ByteLevel().alphabet(), 
            special_tokens=[
                # "<s>",
                # "<pad>",
                # "</s>",
                # "<unk>",
                # "<mask>"
                "<|endoftext|>"
            ]
        )
        self.tokenizer.train(paths, trainer=trainer)
        self.tokenizer.post_processor = processors.ByteLevel(trim_offsets=False)

    def save_tokenizer(self, location, prefix=None):
        if not os.path.exists(location):
            os.makedirs(location)
        # self.tokenizer.model.save(location, prefix)
            
        wrapped_tokenizer = GPT2TokenizerFast(tokenizer_object=tokenizer.tokenizer)
        wrapped_tokenizer.save_pretrained(save_directory=location, filename_prefix=prefix)

if __name__ == '__main__':
    from pathlib import Path

    lang = 'id'

    # the folder 'text' contains all the files
    base_path = os.getcwd()
    store_path = os.path.join(base_path, '{}_corpus'.format(lang))
    paths = [str(x) for x in Path(store_path).glob("*.txt")]

    tokenizer = BPE_token()
    # train the tokenizer model
    tokenizer.bpe_train(paths)
    # saving the tokenized data in our specified folder 
    save_path = 'tokenized_data'
    tokenizer.save_tokenizer(save_path)

    # validate
    sentence = "apa yang akan kamu lakukan jika tidak mengalah."
    encoding = tokenizer.tokenizer.encode(sentence)
    start, end = encoding.offsets[4]
    print(sentence[start:end])
    print(encoding.tokens)

    # tokenizer.tokenizer.decoder = decoders.ByteLevel()
    print(tokenizer.tokenizer.decode(encoding.ids))