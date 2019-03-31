from pytest import raises

from aes_cipher import AESCipher

IV="pbkdf2:sha256:50000$OuPYRGdD$06ced6cf97a1a35e502d68b9ffcdc2980d565148e1c2fdd00d965e2a8da23207"
key="xzwXZ2CoOI8Z/2QH"


def test_enrcypted_data_is_decrypted_properly():
    aes_cipher = AESCipher(key, IV)
    input_data = "some data"

    encrypted_data = aes_cipher.encrypt(input_data)
    decrypted_data = aes_cipher.decrypt(encrypted_data)

    assert input_data == decrypted_data


def test_given_null_key_or_iv_when_decrpyting_then_error_is_raised():
    with raises(AttributeError):
        AESCipher(None, IV)

    with raises(AttributeError):
        AESCipher(key, None)
