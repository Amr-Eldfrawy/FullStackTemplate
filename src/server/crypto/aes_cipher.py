from Crypto.Cipher import AES
import base64

# inspired by https://stackoverflow.com/questions/12524994/encrypt-decrypt-using-pycrypto-aes-256

BS = 16
pad = lambda s: s + (BS - len(s) % BS) * chr(BS - len(s) % BS)
unpad = lambda s : s[0:-ord(s[-1])]


class AESCipher:
    def __init__(self, key, hashed_key):
        self.key = key.encode('ascii', 'backslashreplace')
        self.hashed_key = hashed_key.encode('ascii', 'backslashreplace')

    def encrypt(self, raw):
        raw = raw.encode('ascii', 'backslashreplace')
        raw = pad(raw)
        iv = self.hashed_key[30: 30 + 16]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        result = base64.b64encode(iv + cipher.encrypt(raw))
        return result

    def decrypt(self, enc):
        enc = enc.encode('ascii', 'backslashreplace')
        enc = base64.b64decode(enc)
        iv = enc[:16]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        result = unpad(cipher.decrypt(enc[16:]))
        return result

