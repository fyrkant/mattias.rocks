# mattias.rocks — Claude instructions

## After every git push

After each successful `git push`, fetch the Netlify deploy preview URL from the GitHub commit statuses API and share it with the user:

```bash
COMMIT=$(git rev-parse HEAD)
curl -s "https://api.github.com/repos/fyrkant/mattias.rocks/commits/${COMMIT}/statuses" \
  | python3 -c "
import sys, json
statuses = json.load(sys.stdin)
netlify = [s for s in statuses if 'netlify' in s.get('context','').lower() or 'netlify' in s.get('target_url','').lower()]
if netlify:
    s = netlify[0]
    print(s.get('state'), s.get('target_url'))
else:
    print('No Netlify status found yet')
"
```

The deploy URL looks like: `https://deploy-preview-XX--festive-almeida-150daf.netlify.app`
