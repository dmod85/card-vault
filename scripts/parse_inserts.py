import json
import re
import os

with open("2026 Topps Series 1 Baseball Checklist –.md", "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

sets = []

current_set = None
parsing_mode = None # "parallels" or "cards"

start_idx = 1
while start_idx < len(lines) and not lines[start_idx].strip():
    start_idx += 1

idx = start_idx
while idx < len(lines):
    line = lines[idx].strip()
    
    if not line:
        idx += 1
        continue
        
    if idx + 1 < len(lines) and "cards" in lines[idx+1] and "-" not in lines[idx+1] and "Shop" not in lines[idx+1]:
        if current_set:
            sets.append(current_set)
            
        set_name = line
        current_set = {
            "id": "2026-topps-series-1-" + set_name.lower().replace(" ", "-").replace("'", "").replace(",", "").replace(".", "").replace("é", "e"),
            "name": "2026 Topps Series 1 - " + set_name,
            "year": 2026,
            "brand": "Topps",
            "sport": "Baseball",
            "baseParallels": [{"id": "base", "name": "Base", "odds": "1:1"}],
            "cards": []
        }
        idx += 2 
        parsing_mode = None
        continue

    if line == "75 Years Of Topps Gifts":
        if current_set:
            sets.append(current_set)
        current_set = {
            "id": "2026-topps-series-1-75-years-of-topps-gifts",
            "name": "2026 Topps Series 1 - 75 Years Of Topps Gifts",
            "year": 2026,
            "brand": "Topps",
            "sport": "Baseball",
            "baseParallels": [{"id": "base", "name": "Base", "odds": "1:1"}],
            "cards": []
        }
        parsing_mode = "cards"
        idx += 1
        continue

    if current_set:
        if line.startswith("Parallel"):
            parsing_mode = "parallels"
            idx += 1
            continue
            
        if "on eBay" in line or line.startswith("Shop for") or "Exclusive" in line:
            parsing_mode = "cards"
            idx += 1
            continue
            
        if parsing_mode == "parallels":
            p_id = re.sub(r"[^a-zA-Z0-9]+", "-", line.lower()).strip("-")
            current_set["baseParallels"].append({"id": p_id, "name": line})
            
        elif parsing_mode == "cards":
            match = re.match(r'^([A-Z0-9\-]+)\s+(.+?)(?:,\s+(.+))?$', line)
            
            if match:
                card_num = match.group(1)
                player_name = match.group(2)
                team = match.group(3) if match.group(3) else ""
                
                c_id = f"{current_set['id']}-{card_num.lower()}"
                current_set["cards"].append({
                    "id": c_id,
                    "cardNumber": card_num,
                    "playerName": player_name.strip(),
                    "team": team.strip(),
                    "rarity": "Insert"
                })
            else:
                parts = line.split(",")
                if len(parts) >= 2 and not line.endswith("cards"):
                    player = parts[0].strip()
                    team = parts[1].strip()
                    c_id = f"{current_set['id']}-{re.sub(r'[^a-zA-Z0-9]+', '-', player.lower())}"
                    current_set["cards"].append({
                        "id": c_id,
                        "cardNumber": "NA",
                        "playerName": player,
                        "team": team,
                        "rarity": "Insert"
                    })
                elif "1 " in line or "20 " in line or "50 " in line or "350 " in line:
                     parts2 = line.split(" ", 1)
                     c_num = parts2[0]
                     c_rest = parts2[1]
                     p_match = re.search(r'(.+),\s+(.+)', c_rest)
                     if p_match:
                         player = p_match.group(1)
                         team = p_match.group(2)
                         c_id = f"{current_set['id']}-{c_num.lower()}"
                         current_set["cards"].append({
                             "id": c_id,
                             "cardNumber": c_num,
                             "playerName": player,
                             "team": team,
                             "rarity": "Promo"
                         })
                elif "Ticket" in line or "Gift" in line or "Experience" in line or "Card" in line:
                     c_id = f"{current_set['id']}-{re.sub(r'[^a-zA-Z0-9]+', '-', line.lower())}"
                     current_set["cards"].append({
                         "id": c_id,
                         "cardNumber": "GIFT",
                         "playerName": line,
                         "team": "",
                         "rarity": "Promo"
                     })
                     
    idx += 1

if current_set:
    sets.append(current_set)

os.makedirs("src/data/sets", exist_ok=True)

count = 0
for s in sets:
    if len(s["cards"]) > 0:
        with open(f"src/data/sets/{s['id']}.json", "w", encoding="utf-8") as f:
            json.dump(s, f, indent=2)
        count += 1

print(f"Successfully generated {count} insert sets!")
