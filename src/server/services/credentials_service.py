from pymongo import ReturnDocument


class CredentialsService:

    def __init__(self, credentials_collection):
        self.credentials_collection = credentials_collection

    def add_credential_and_read_all(self, user_id, email, plain_password, key):
        return self.credentials_collection.find_one_and_update(
            {'_id': user_id},
            {
                '$push': {
                    'credentials':
                        {
                            'email': email,
                            'password': key.encrypt(bytes(plain_password)).encode('base64')
                        }
                }
            },
            upsert=True,
            return_document=ReturnDocument.AFTER
        )

    def user_has_email(self, user_id, email):
        existing_credentials = self.credentials_collection.find_one({'_id': user_id})
        if existing_credentials is None or existing_credentials.get('credentials') is None:
            return False

        # can be searched better
        for credential in existing_credentials['credentials']:
            if credential['email'] == email:
                return True

        return False

    def delete_email_and_read_all(self, user_id, email_to_delete):
        return self.credentials_collection.find_one_and_update(
            {'_id': user_id},
            {
                '$pull': {
                    'credentials':
                        {
                            'email': email_to_delete,
                        }
                }
            },
            upsert=True,
            return_document=ReturnDocument.AFTER
        )

    def read_all_credentials(self, user_id):
        return self.credentials_collection.find_one({'_id': user_id})

    @staticmethod
    def decrypt_credentials(user_credentials, key):

        if user_credentials is None or user_credentials.get('credentials') is None:
            return {
                'credentials': []
            }

        for credential in user_credentials['credentials']:
            credential['password'] = key.decrypt(credential['password'].decode('base64'))

        return user_credentials
