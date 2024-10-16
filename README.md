# ServiceAIGame

Denna prototyp av en AI-tjänst fokuserar på att implementera AI genererade meddelanden samt handling som en fiende kan tänka sig att genomföra i ett "turn-based" spel.

&nbsp;&nbsp;&nbsp;&nbsp;Detta inkluderar att exempelvis en goblin kan välja mellan 3 olika attacker, men att responsen måste inkludera namnet på attacken för att utföra den. Från spelarens perspektiv ser det ut som att attackens namn kommer efter det som denna goblin säger/gör som en separat mening/sats/bisats så att det inte framstår som att goblin faktiskt säger namnet på attacken "in-game".

Målgruppen jag har valt att fokusera på är de som gillar att spela "turn-based rpgs" varav målgruppens ålder är inriktad på de som är mogna nog att hantera läsningen av beskrivande svordomar och gore i textformat.

När det kommer till säker användning saknas det relevans från användaren då de ej själva kan skriva till spelets AI, utan endast välja mellan val av fördefinierade alternativ - tänk "silent protagonist".

&nbsp;&nbsp;&nbsp;&nbsp;När det kommer till den etiska frågan för att undvika exkludering och fördomar samt dylika ting bör spelets AI hantera det automatiskt pågrund av den är tagen direkt från OpenAI. Även om det skulle falla igenom är det planerat att insätta filter som blockerar användningen av specifika ord/meningar innan en potentiell lansering av spelet.

De enda tankarna jag har haft är att jag vill spela ett spel som är "turn-based rpg" och som inkluderar oändliga omkörningar med variation. Hoppet är väl att ha en LLM som inte kräver en extern API-nyckel med begränsade användningar, men vi får se.
