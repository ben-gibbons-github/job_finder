#!/bin/zsh
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"

probe() {
    local url=$1
    local p2_url=$2
    echo "--- URL: $url ---"
    status_code=$(/usr/bin/curl -sL -A "$UA" -o temp_body.txt -w "%{http_code}" "$url" --connect-timeout 10 --max-time 20)
    echo "Status: $status_code"
    
    if [[ "$status_code" == "200" ]]; then
        echo "Sample Job Links:"
        grep -Eo 'href="[^"]*(job|vacancy|opportunity|position)[^"]*"' temp_body.txt | grep -Ev "google|facebook|twitter|linkedin|apple|amazon|schemas|css|js|favicon" | head -n 12
        
        if [[ -n "$p2_url" ]]; then
            p2_status=$(/usr/bin/curl -sL -A "$UA" -o temp_p2.txt -w "%{http_code}" "$p2_url" --connect-timeout 10 --max-time 20)
            echo "Page 2 Status: $p2_status (URL: $p2_url)"
            echo "Page 2 Length: $(wc -c < temp_p2.txt) bytes"
        fi
    fi
    echo ""
}

probe "https://www.idealist.org/en/nonprofit-jobs?q=arts" "https://www.idealist.org/en/nonprofit-jobs?p=2&q=arts"
probe "https://www.idealist.org/en/nonprofit-jobs?q=creative" "https://www.idealist.org/en/nonprofit-jobs?p=2&q=creative"
probe "https://www.charityjob.co.uk/volunteer-jobs/arts-culture-jobs" "https://www.charityjob.co.uk/volunteer-jobs/arts-culture-jobs?page=2"
probe "https://www.artjobs.com/jobs" "https://www.artjobs.com/jobs?page=1"

rm -f temp_body.txt temp_p2.txt
