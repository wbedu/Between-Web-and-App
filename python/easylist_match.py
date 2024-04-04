import re2 as re
from adblockparser import AdblockRules, AdblockRule

easylist_file = "easyprivacy.txt"

def read_easylist_file():
    with open(easylist_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()[1:]  # Skip the first line
        easylist_rules = [line.strip() for line in lines if not line.startswith('!') and line.strip()]
        return easylist_rules

def read_requestURLS(f):
    with open(f, 'r') as file:
        lines = file.readlines()[1:]  # Skip the header
        requestURLs = [line.strip().split('\t')[1] for line in lines]
        return requestURLs

if __name__ == '__main__':
    raw_rules = read_easylist_file()
    print(len(raw_rules))

    rules = AdblockRules(raw_rules, use_re2=True, max_mem=512*1024*1024)
    # requestURLs = read_requestURLS('web_skype.tsv')
    # requestURLs = read_requestURLS('electron_skype_test.tsv')
    # requestURLs = read_requestURLS("web_skype_test.tsv")

    # requestURLs = read_requestURLS('electron_spotify.tsv')
    # requestURLs = read_requestURLS('web_spotify.tsv')

    # requestURLs = read_requestURLS('electron_github.tsv')
    # requestURLs = read_requestURLS('web_github.tsv')

    # requestURLs = read_requestURLS('electron_splice.tsv')
    # requestURLs = read_requestURLS('web_splice.tsv')

    # requestURLs = read_requestURLS('electron_wordpress.tsv')
    requestURLs = read_requestURLS('electron_wordpress_test.tsv')
    # requestURLs = read_requestURLS('web_wordpress.tsv')

    # requestURLs = read_requestURLS('electron_slack.tsv')
    # requestURLs = read_requestURLS('web_slack.tsv')


    matches = []
    for url in requestURLs:
        if rules.should_block(url):
            # print(f"Match found for URL '{url}' with pattern '{pattern}'")
            # matches.append({'url': url, 'pattern': pattern})
            print(f"URL {url} is filtered")
            matches.append(url)
    # options = AdblockRule.BINARY_OPTIONS + ['domain']
    # for url in requestURLs:
    #     matched_rules = []
    #     for rule in rules.rules:
    #         if rule.match_url(url, options=options):
    #             matched_rules.append(rule.raw_rule_text)
    #
    #     if matched_rules:
    #         print(f"URL {url} is filtered by rules: {matched_rules}")
    #         matches.append({'url': url, 'matched_rules': matched_rules})
    print(len(matches))
