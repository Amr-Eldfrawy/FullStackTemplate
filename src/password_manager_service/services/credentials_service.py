from pymongo import ReturnDocument
from mongosanitizer import sanitizer

class CredentialsService:

    def __init__(self, credentials_collection):
        self.credentials_collection = credentials_collection

    def add_credential_and_read_all(self, user_id, email, plain_password, key):
        # mutate the existing query for nosql attacks
        query = {'_id': user_id}
        sanitizer.sanitize(query)

        return self.credentials_collection.find_one_and_update(
            {'_id': user_id},
            {
                '$push': {
                    'credentials':
                        {
                            'email': email,
                            'password': key.encrypt(plain_password)
                        }
                }
            },
            upsert=True,
            return_document=ReturnDocument.AFTER
        )

    def user_has_email(self, user_id, email):
        # mutate the existing query for nosql attacks
        query = {'_id': user_id}
        sanitizer.sanitize(query)

        existing_credentials = self.credentials_collection.find_one(query)
        if existing_credentials is None or existing_credentials.get('credentials') is None:
            return False

        # can be searched better
        for credential in existing_credentials['credentials']:
            if credential['email'] == email:
                return True

        return False

    def delete_email_and_read_all(self, user_id, email_to_delete):
        # mutate the existing query for nosql attacks
        query = {'_id': user_id}
        sanitizer.sanitize(query)

        return self.credentials_collection.find_one_and_update(
            query,
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
        # mutate the existing query for nosql attacks
        query = {'_id': user_id}
        sanitizer.sanitize(query)

        return self.credentials_collection.find_one(query)

    @staticmethod
    def decrypt_credentials(user_credentials, key):

        if user_credentials is None or user_credentials.get('credentials') is None:
            return {
                'credentials': []
            }

        for credential in user_credentials['credentials']:
            credential['password'] = key.decrypt(credential['password'])

        return user_credentials
