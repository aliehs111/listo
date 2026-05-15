"""Moderation service stub — will flag vulgarity, spam, abuse."""


def check_message(text: str) -> dict:
    # TODO: implement moderation
    return {
        "contains_vulgarity": False,
        "moderation_action": None,
        "moderation_reason": None,
    }
