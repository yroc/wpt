def main(request, response):
    """
    Returns a response with a Set-Cookie header based on the query params.
    The body will be "1" if the cookie is present in the request, otherwise "0".
    """
    samesite = request.GET.first("samesite")
    cookie_name = request.GET.first("cookie-name")
    cookie_in_request = "0"
    if request.cookies.get(cookie_name):
        cookie_in_request = request.cookies[cookie_name].value

    headers = [
        ("Content-Type", "text/html"),
        ("Set-Cookie", cookie_name + "=1; Secure; Max-Age=1; SameSite=" + samesite)
    ]
    return (200, headers, cookie_in_request)
