from blacklist_service import BlackListService


def test_when_blacklisting_token_then_is_black_listed_returns_true():
    # given
    blackListService = BlackListService()

    # when
    blackListService.blacklist('some token')

    # then
    assert blackListService.is_black_listed('some token')


