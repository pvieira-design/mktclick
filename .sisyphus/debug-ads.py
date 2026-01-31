from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    console_messages = []
    network_errors = []
    trpc_responses = []

    page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
    
    def handle_response(response):
        url = response.url
        if "trpc" in url and "ads" in url:
            try:
                body = response.text()
                trpc_responses.append({
                    "url": url,
                    "status": response.status,
                    "body": body[:2000]
                })
            except:
                trpc_responses.append({
                    "url": url,
                    "status": response.status,
                    "body": "(could not read)"
                })
    
    def handle_request_failed(request):
        network_errors.append(f"{request.method} {request.url} - {request.failure}")
    
    page.on("response", handle_response)
    page.on("requestfailed", handle_request_failed)
    
    # Navigate to login first (need auth)
    page.goto("http://localhost:3001/ads", wait_until="networkidle", timeout=30000)
    
    # Check if redirected to login
    current_url = page.url
    print(f"Current URL: {current_url}")
    
    if "/login" in current_url:
        print("Redirected to login - need to authenticate first")
        page.screenshot(path="/Users/pedromota/Desktop/ClaudeCodeProjects/Marketing/marketingclickcannabis/.sisyphus/debug-login.png")
    else:
        # Wait for content to load
        page.wait_for_timeout(5000)
        
        page.screenshot(path="/Users/pedromota/Desktop/ClaudeCodeProjects/Marketing/marketingclickcannabis/.sisyphus/debug-ads-page.png", full_page=True)
        
        print("\n=== Console Messages ===")
        for msg in console_messages:
            print(msg)
        
        print("\n=== Network Errors ===")
        for err in network_errors:
            print(err)
        
        print("\n=== tRPC Responses (ads) ===")
        for resp in trpc_responses:
            print(f"URL: {resp['url']}")
            print(f"Status: {resp['status']}")
            print(f"Body: {resp['body']}")
            print("---")
        
        # Check page content
        heading = page.locator("h1").first.text_content() if page.locator("h1").count() > 0 else "No h1"
        print(f"\nPage heading: {heading}")
        
        # Check for error states
        error_text = page.locator("text=Não foi possível").count()
        empty_text = page.locator("text=Nenhum anúncio").count()
        skeleton_count = page.locator("[class*='skeleton']").count()
        card_count = page.locator("[class*='ring-border-secondary']").count()
        
        print(f"Error states: {error_text}")
        print(f"Empty states: {empty_text}")
        print(f"Skeletons visible: {skeleton_count}")
        print(f"Cards visible: {card_count}")
    
    browser.close()
