
class BlackListService:

    def __init__(self):
        # keep the interface but replace this with redis TTL memory
        self.data_store = set()

    def blacklist(self, token):
        self.data_store.add(token)

    def is_black_listed(self, token):
        return token in self.data_store

    def clear_cache(self):
        self.data_store.clear()
