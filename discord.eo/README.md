# discord.eo

مكتبة بوتات ديسكورد للغة **eo**. مكتوبة بـ eo نفسها، وتشتغل مع `eo main.eo` ومع `eo build`.

```eo
import discord

load_env()
var bot = discord.Bot(env("DISCORD_TOKEN"))

bot.command "ping", lambda msg, args {
    msg.reply "pong"
}

bot.run
```

---

## التثبيت

داخل مجلد مشروعك:

```bash
eo get https://github.com/USER/discord.eo
```

ينزل `discord.eo` جنب ملفاتك، وتستخدمه بـ `import discord`. أو انسخ `discord.eo` يدويًا جنب ملف البوت.

> تحتاج `eo.exe` الجديد (فيه القيم الافتراضية للدوال و `time_iso` و `read_file` و `save_json`).

## تجهيز البوت في ديسكورد

1. ادخل [Developer Portal](https://discord.com/developers/applications) واضغط **New Application**.
2. من **Bot** اضغط **Reset Token** وانسخ التوكن.
3. في نفس الصفحة، تحت **Privileged Gateway Intents**، فعّل **Message Content Intent**. بدونها يوصلك نص الرسائل فاضي.
4. من **OAuth2 > URL Generator** اختر `bot`، وتحت الصلاحيات اختر **Send Messages** و **Add Reactions** و **Read Message History**. افتح الرابط اللي يطلع وأضف البوت لسيرفرك.
5. سوِّ ملف `.env` جنب البوت:

```
DISCORD_TOKEN=التوكن_حقك
```

> ⚠️ التوكن مثل الباسوورد: لا ترسله لأحد ولا ترفعه على GitHub. حط `.env` في `.gitignore`.

بعدها شغّل:

```bash
eo bot.eo
```
```
[discord] Online as MyBot
```

---

## الأحداث

```eo
bot.on "ready", lambda {
    print "Online as " + bot.user.name
}

bot.on "message", lambda msg {
    if msg.content == "سلام" {
        msg.react "👋"
    }
}

bot.on "member_join", lambda m {
    m.send "حياك في السيرفر " + m.mention
}

# أي حدث من ديسكورد باسمه، ويوصلك كقاموس
bot.on "GUILD_BAN_ADD", lambda d {
    print "ban: " + d["user"]["username"]
}
```

| الحدث | يوصلك | يحتاج |
|---|---|---|
| `"ready"` | بدون: البوت اتصل، و `bot.user` جاهز | |
| `"message"` | `msg` (حتى رسايل البوتات) | |
| `"message_edit"` | `msg` بعد التعديل | |
| `"message_delete"` | `msg` فيه `id` و `channel_id` بس | |
| `"member_join"` | `Member` | `GUILD_MEMBERS` |
| `"member_leave"` | `Member` (فيه `id` و `name`) | `GUILD_MEMBERS` |
| `"member_update"` | `Member` (تغيرت رتبه أو اسمه) | `GUILD_MEMBERS` |
| `"reaction_add"` ، `"reaction_remove"` | `Reaction` | |
| `"guild_join"` ، `"guild_leave"` | `Guild` (البوت دخل / طلع من سيرفر) | |
| `"channel_create"` ، `"channel_delete"` | `Channel` | |
| أي اسم من [أحداث ديسكورد](https://discord.com/developers/docs/topics/gateway-events) | `d` (قاموس كما هو) | |

## الأوامر

```eo
bot.prefix = "!"          # الافتراضي

# !say مرحبا يا شباب
bot.command "say", lambda msg, args {
    msg.reply join(args, " ")     # args = ["مرحبا", "يا", "شباب"]
}
```

- اسم الأمر ما يفرق فيه الحرف الكبير والصغير (`!PING` = `!ping`).
- أكثر من اسم لنفس الأمر: `bot.command ["ping", "p"], lambda msg, args { ... }`.
- الأوامر ما تشتغل على رسايل البوتات (ولا على البوت نفسه).

## الرسالة `msg`

| الحقل | وش فيه |
|---|---|
| `msg.content` | النص |
| `msg.author` | المرسل: `msg.author.name` و `msg.author.display_name` و `msg.author.id` و `msg.author.bot` |
| `msg.id` ، `msg.channel_id` ، `msg.guild_id` | الأرقام (نصوص). `guild_id` فاضي في الخاص |
| `msg.member` | المرسل كـ `Member` (رتبه واسمه في السيرفر). `none` في الخاص |
| `msg.guild` | السيرفر كـ `Guild`. `none` في الخاص |
| `msg.channel` | القناة كـ `Channel` |
| `msg.mentions` | قائمة `User` للناس اللي انمنشنوا |
| `msg.is_dm` | `true` لو الرسالة في الخاص |
| `msg.raw` | كل بيانات الرسالة من ديسكورد كقاموس |

| الـ method | وش تسوي |
|---|---|
| `msg.reply "نص"` | ترد على الرسالة |
| `msg.send "نص"` | ترسل رسالة عادية في نفس القناة |
| `msg.react "👍"` | تحط رياكشن، أو كذا وحدة: `msg.react ["1️⃣", "2️⃣"]` |
| `msg.send_embed "عنوان", "نص"` | Embed في نفس القناة (اللون اختياري) |
| `msg.send_file "صورة.png"` | ملف في نفس القناة |
| `msg.reply_embed "العنوان", "النص"` | ترد بصندوق مرتب (واللون اختياري: `, discord.GREEN`) |
| `msg.edit "نص"` | تعدل رسالة أرسلها البوت |
| `msg.delete` | تحذف الرسالة (تحتاج صلاحية Manage Messages) |

## البوت `bot`

| | |
|---|---|
| `discord.Bot(token)` | يسوي بوت |
| `bot.prefix` | بادئة الأوامر (`"!"`) |
| `bot.intents` | الأحداث اللي يبيها (شوف تحت) |
| `bot.log` | `false` يوقف رسائل `[discord]` |
| `bot.user` | البوت نفسه (بعد `ready`) |
| `bot.on name, f` | يسجّل حدث |
| `bot.command name, f` | يسجّل أمر |
| `bot.send channel_id, "نص"` | يرسل رسالة لأي قناة (نص أو View أو LayoutView أو Embed) |
| `bot.slash name, description, f` | أمر سلاش (تحت) |
| `bot.component id, f` | زر دايم (تحت) |
| `bot.guild_id` | سيرفر التجربة لأوامر السلاش |
| `bot.dm user, x` | رسالة خاص |
| `bot.guild id` ، `bot.guild_list()` ، `bot.channel id` ، `bot.fetch_user id` | سيرفر / كل السيرفرات / قناة / مستخدم |
| `bot.playing` ... `bot.set_status` | حالة البوت (تحت) |
| `bot.request(method, path, body)` | أي طلب لـ [Discord API](https://discord.com/developers/docs/reference)، مثل `bot.request("GET", "/users/@me", none)` |
| `bot.run` | يشغّل البوت (ما يرجع إلا لما يوقف) |
| `bot.stop` | يوقف البوت |

### رسائل فيها embed أو أكثر

```eo
var e = discord.embed("العنوان", "النص")
e["fields"] = [{"name": "eo", "value": "🔥"}]
bot.send msg.channel_id, {"content": "شوف:", "embeds": [e]}
```

أي قاموس ترسله يروح لديسكورد كما هو، فتقدر تستخدم كل خيارات الرسائل.

### Intents

```eo
bot.intents = discord.GUILDS + discord.GUILD_MESSAGES + discord.MESSAGE_CONTENT + discord.GUILD_MEMBERS
```

الافتراضي `discord.DEFAULT_INTENTS`: `GUILDS` و `GUILD_MESSAGES` و `GUILD_MESSAGE_REACTIONS` و `DIRECT_MESSAGES` و `DIRECT_MESSAGE_REACTIONS` و `MESSAGE_CONTENT`.

الموجودة: `GUILDS` `GUILD_MEMBERS` `GUILD_MODERATION` `GUILD_EMOJIS` `GUILD_INVITES` `GUILD_VOICE_STATES` `GUILD_PRESENCES` `GUILD_MESSAGES` `GUILD_MESSAGE_REACTIONS` `DIRECT_MESSAGES` `DIRECT_MESSAGE_REACTIONS` `MESSAGE_CONTENT`، و `discord.ALL_INTENTS` فيها كلها.

`GUILD_MEMBERS` و `GUILD_PRESENCES` و `MESSAGE_CONTENT` (Privileged) لازم تفعلها في Developer Portal.

لو تبي أحداث الأعضاء (`member_join` ...): `bot.intents = discord.DEFAULT_INTENTS + discord.GUILD_MEMBERS` وفعّل **Server Members Intent** في البورتال.

---

## الأعضاء: `Member`

```eo
bot.command "kick", lambda msg, args {
    if not msg.member.has_role("Admin") {
        msg.reply "هذا الأمر للإدارة بس"
        return
    }
    if len(msg.mentions) == 0 {
        msg.reply "منشن الشخص: !kick @فلان"
        return
    }
    var m = msg.guild.member(msg.mentions[0])
    m.send "انطردت من " + msg.guild.name
    m.kick "طرده " + msg.author.name
    msg.reply "✅ طردت " + m.display_name
}
```

| الحقل | وش فيه |
|---|---|
| `m.id` ، `m.name` | الرقم واسم المستخدم |
| `m.display_name` | الاسم في السيرفر (اللقب لو فيه) |
| `m.nick` | اللقب، أو `""` |
| `m.mention` | `<@رقمه>` تحطه في رسالة |
| `m.avatar_url` | رابط صورته |
| `m.roles` | أرقام رتبه |
| `m.joined_at` | متى دخل (نص ISO، تقدر `time_parse(m.joined_at)`) |
| `m.user` | الـ `User` حقه |
| `m.bot` | هل هو بوت |

| الـ method | وش تسوي | الصلاحية |
|---|---|---|
| `m.send x` | رسالة على الخاص | |
| `m.kick` / `m.kick "سبب"` | طرد | Kick Members |
| `m.ban` / `m.ban "سبب", 1` | باند (الرقم: كم يوم من رسايله ينحذف، لين 7) | Ban Members |
| `m.timeout 600` / `m.timeout 600, "سبب"` | تايم أوت بالثواني (لين 28 يوم) | Moderate Members |
| `m.untimeout` | يشيل التايم أوت | Moderate Members |
| `m.add_role r` / `m.remove_role r` | يضيف / يشيل رتبة (`Role` أو رقمها) | Manage Roles |
| `m.has_role r` | `Role` أو رقمها أو **اسمها** | |
| `m.role_list()` | رتبه كـ `Role` | |
| `m.set_nick "اسم"` | يغير لقبه (`""` يرجعه) | Manage Nicknames |

السبب يطلع في سجل السيرفر (Audit Log). البوت ما يقدر يطرد أو يعطي رتبة لأحد رتبته أعلى من رتبة البوت.

## الخاص

```eo
msg.author.send "هلا 👋"                  # User
member.send "رسالة"                        # Member
bot.dm "123456789012345678", "رسالة"       # بالرقم
```

كلها تاخذ نص أو `View` أو `LayoutView` أو `Embed`. لو الشخص قافل الخاص، ترجع `none` وتطبع `User ... has DMs closed`. رسايل الخاص توصلك في `"message"` و `msg.is_dm` يكون `true`.

## السيرفر: `Guild`

```eo
bot.command "server", lambda msg, args {
    var g = msg.guild
    var e = discord.Embed(g.name, "")
    e.inline "الأعضاء", string(g.member_count)
    e.inline "القنوات", string(len(g.channels))
    e.inline "الرتب", string(len(g.roles))
    e.thumbnail = g.icon_url
    msg.reply e
}
```

| | |
|---|---|
| `g.id` ، `g.name` ، `g.owner_id` ، `g.member_count` ، `g.icon_url` | معلوماته |
| `g.channels` ، `g.roles` | قوائم `Channel` و `Role` (تتحدث لحالها) |
| `g.find_channel "general"` | قناة بالاسم أو الرقم، أو `none` |
| `g.find_role "Admin"` | رتبة بالاسم أو الرقم، أو `none` |
| `g.member id` | `Member` من ديسكورد (`id` = رقم أو `User`) |
| `g.members` / `g.members 500` | كل الأعضاء (يحتاج `GUILD_MEMBERS`) |
| `g.kick user` ، `g.ban user, "سبب"` ، `g.unban user` | بدون ما تجيب `Member` |
| `g.bans` | المبندين: `[{"user": User, "reason": "..."}]` |
| `g.create_channel "اسم"` | قناة كتابية. `g.create_channel "صوت", discord.VOICE` صوتية |
| `g.create_role "VIP"` / `g.create_role "VIP", 16766720` | رتبة (باللون) |
| `g.leave` | البوت يطلع |

`bot.guild "رقم"` يجيب أي سيرفر، و `bot.guild_list()` كل السيرفرات اللي فيها البوت.

## القنوات والرتب

| `Channel` | |
|---|---|
| `c.id` ، `c.name` ، `c.kind` ، `c.topic` ، `c.mention` ، `c.parent_id` | `kind`: `discord.TEXT` `VOICE` `CATEGORY` `NEWS` `STAGE` `FORUM` |
| `c.send x` | ترسل فيها |
| `c.history` / `c.history 100` | آخر الرسايل كـ `Message` |
| `c.purge 20` | تحذف آخر 20 (لين 100، أحدث من 14 يوم). ترجع العدد |
| `c.typing` | "البوت يكتب..." |
| `c.rename "اسم"` ، `c.set_topic "نص"` ، `c.delete` | |

| `Role` | |
|---|---|
| `r.id` ، `r.name` ، `r.color` ، `r.position` ، `r.mention` | |
| `r.rename "اسم"` ، `r.delete` | |

`bot.channel "رقم"` يرجع `Channel`.

## الرياكشنات: `Reaction`

```eo
# رتب بالرياكشن
const MESSAGE_ID = "رقم_رسالة_الرتب"
bot.on "reaction_add", lambda r {
    if r.message_id == MESSAGE_ID and r.emoji == "⭐" {
        r.member.add_role bot.guild(r.guild_id).find_role("VIP")
    }
}
```

`r.emoji` (`"⭐"` أو `"اسم:رقم"`)، `r.user_id`، `r.member` (في السيرفرات)، `r.message_id`، `r.channel_id`، `r.guild_id`. و `r.user()` يجيب الـ `User`، و `r.remove` يشيل رياكشنه.

## حالة البوت

```eo
bot.playing "eo"          # Playing eo
bot.watching "السيرفر"    # Watching السيرفر
bot.listening "قرآن"
bot.competing "بطولة"
bot.set_status "idle"     # online / idle / dnd / invisible
```

تحطها قبل `bot.run` أو في أي وقت بعده.

---

## اختصارات الإرسال

كل شي تقدر ترسل له، فيه `send` و `send_embed` و `send_file`:

| | نص أو أي شي | Embed | ملف |
|---|---|---|---|
| القناة اللي فيها الرسالة | `msg.send x` | `msg.send_embed "عنوان", "نص"` | `msg.send_file "a.png"` |
| رد | `msg.reply x` | `msg.reply_embed "عنوان", "نص"` | |
| أي قناة | `bot.send id, x` | `bot.send_embed id, "عنوان", "نص"` | `bot.send_file id, "a.png"` |
| Channel | `c.send x` | `c.send_embed "عنوان", "نص"` | `c.send_file "a.png"` |
| خاص User | `user.send x` | `user.send_embed "عنوان", "نص"` | `user.send_file "a.png"` |
| خاص Member | `m.send x` | `m.send_embed "عنوان", "نص"` | `m.send_file "a.png"` |
| خاص بالرقم | `bot.dm id, x` | `bot.dm_embed id, "عنوان", "نص"` | |
| زر / سلاش | `i.reply x` | `i.reply_embed "عنوان", "نص"` | |

- `send_embed` و `reply_embed`: النص واللون اختياريين. `target.send_embed "تنبيه", "لا تسبم", discord.RED`
- `i.reply_embed "عنوان", "نص", discord.GREEN, true` (آخر شي `true` = مخفي، بس اللي ضغط يشوفه).

### الألوان

`discord.RED` `GREEN` `BLUE` `YELLOW` `ORANGE` `PURPLE` `PINK` `GOLD` `WHITE` `BLACK` `GRAY`، و `discord.COLOR` (أحمر eo)، أو أي لون: `discord.color("#57F287")`.

### الملفات

```eo
msg.send_file "logo.png"                       # ملف لحاله
msg.send_file "logo.png", "هذا الشعار"          # مع نص

var e = discord.Embed("الشعار", "")
e.image = "attachment://logo.png"               # الصورة داخل الـ Embed
msg.channel.send_file "logo.png", e

msg.author.send_file "report.txt"               # على الخاص
```

المسار جنب ملف البوت (أو جنب الـ exe). الحد 10MB. لو الملف مو موجود يطبع `File not found` والبوت يكمل.

### حفظ البيانات

eo فيها `save_json` و `load_json`، فالبيانات تبقى بعد ما تطفي البوت:

```eo
var points = load_json("points.json", {})

bot.on "message", lambda msg {
    if msg.author.bot {
        return
    }
    points[msg.author.id] = get(points, msg.author.id, 0) + 1
    save_json "points.json", points
}

bot.command "points", lambda msg, args {
    msg.reply_embed "نقاطك", string(get(points, msg.author.id, 0)), discord.GOLD
}
```

---

## الأزرار والقوائم: `View`

```eo
bot.command "menu", lambda msg, args {
    var view = discord.View("اختر:")

    view.button "👍 حلو", lambda i {
        i.reply "شكرًا " + i.user.display_name
    }

    var del = view.button "احذف", lambda i { i.message.delete }
    del.style = "red"

    view.link "الموقع", "https://eolang.netlify.app"

    view.select "لونك المفضل", ["أحمر", "أزرق", "أخضر"], lambda i {
        i.reply_hidden "اخترت " + i.values[0]
    }

    msg.reply view
}
```

| | |
|---|---|
| `discord.View("نص")` | رسالة فيها أزرار (النص اختياري: `discord.View()`) |
| `view.button "نص", f` | زر. يرجع الزر عشان تعدله |
| `view.link "نص", url` | زر يفتح رابط |
| `view.select "نص", [خيارات], f` | قائمة. الخيار نص، أو `{"label", "value", "description", "emoji"}` |
| `view.user_select` ، `role_select` ، `channel_select` `"نص", f` | قائمة أعضاء / رتب / قنوات |
| `view.new_row` | اللي بعدها ينزل سطر جديد (الأزرار تترتب 5 في كل سطر لحالها) |
| `view.embed e` | يحط Embed فوق الأزرار |

تعدّل الزر بعد ما تسويه: `b.style` (`"blue"` `"gray"` `"green"` `"red"`)، `b.emoji = "🔥"`، `b.disabled = true`، `b.id = "اسم"`.
وفي القائمة: `s.min` و `s.max` (كم خيار يختار)، `s.disabled`.

## Components V2: `LayoutView` و `Container`

```eo
bot.command "card", lambda msg, args {
    var layout = discord.LayoutView()
    var box = layout.container()

    box.text "## هلا " + msg.author.display_name
    box.separator
    box.section "eo لغة برمجة بسيطة", "https://example.com/logo.png"
    box.image "https://example.com/banner.png"

    var row = box.row()
    row.button "ابدأ", lambda i { i.reply_hidden "يلا!" }

    msg.reply layout
}
```

| | |
|---|---|
| `discord.LayoutView()` | رسالة بالتصميم الجديد |
| `layout.container()` | صندوق بخط ملون. `box.color = 5793266` تغير اللون، `box.spoiler = true` |
| `.text "markdown"` | نص (يدعم `#` و `**` و `-`) |
| `.separator` / `.space` | خط فاصل / مسافة فاضية |
| `.section "نص", "رابط صورة"` | نص وجنبه صورة صغيرة |
| `.section "نص", discord.Button("زر", f)` | نص وجنبه زر |
| `.image url` / `.gallery [urls]` | صورة / معرض صور (لين 10) |
| `.row()` | سطر أزرار وقوائم، وهو `View` فتستخدم `.button` `.select` ... |

كل هذي موجودة في `LayoutView` وفي `Container`. رسالة LayoutView ما تقدر تحط فيها `content` ولا embeds عادية (هذا قانون ديسكورد).

## الضغطات: `i` (Interaction)

كل زر وقائمة ونموذج وأمر سلاش يوصلك `i`:

| الحقل | وش فيه |
|---|---|
| `i.user` | اللي ضغط (User) |
| `i.member` ، `i.guild` | اللي ضغط كـ Member، والسيرفر (في السيرفرات) |
| `i.message` | الرسالة اللي فيها الزر (Message) |
| `i.values` | اللي اختاره من القائمة |
| `i.fields` | اللي كتبه في النموذج |
| `i.options` | خيارات أمر السلاش |
| `i.channel_id` ، `i.guild_id` ، `i.raw` | |

| الـ method | وش تسوي |
|---|---|
| `i.reply x` | يرد (x نص أو View أو LayoutView أو Embed) |
| `i.reply_hidden x` | رد يشوفه اللي ضغط بس |
| `i.update x` | يعدل الرسالة اللي فيها الزر |
| `i.modal form` | يفتح نموذج |
| `i.defer` | "استنى" لو بتاخذ أكثر من 3 ثواني |
| `i.followup x` | رسالة ثانية بعد الرد |
| `i.edit x` | يعدل ردك |

لازم ترد خلال **3 ثواني**. لو الزر ما رد بشي، المكتبة تقول لديسكورد "وصلت" لحالها عشان ما يطلع "This interaction failed".

## النماذج: `Modal`

```eo
var form = discord.Modal("التسجيل", lambda i {
    i.reply "هلا " + i.fields["الاسم"]
})
form.input "الاسم"
var about = form.paragraph "نبذة عنك"
about.required = false
about.placeholder = "اكتب شي عنك"

i.modal form     # من داخل زر أو أمر سلاش
```

`form.input` سطر واحد، `form.paragraph` نص طويل. تعدل: `placeholder` `value` `description` `required` `min` `max` `id`. الجواب في `i.fields["اسم الحقل"]` (أو `id` لو حطيته). لين 5 حقول.

## أوامر السلاش: `bot.slash`

```eo
bot.slash "ping", "يرد pong", lambda i {
    i.reply "pong 🏓"
}

var say = bot.slash "say", "يكرر كلامك", lambda i {
    i.reply i.options["text"]
}
say.text "text", "وش أقول"
var n = say.number "times", "كم مرة"
n.required = false
```

| نوع الخيار | يرجع في `i.options` |
|---|---|
| `.text` | نص |
| `.number` | رقم صحيح |
| `.decimal` | رقم بكسور |
| `.boolean` | true / false |
| `.user` | User |
| `.channel` ، `.role` | الرقم (نص) |

`opt.required = false` اختياري (لو ما كتبه ما يكون في `i.options`، استخدم `get(i.options, "times", 1)`). `opt.choices = ["أ", "ب"]` يخليه يختار من قائمة.

الأوامر تتسجل لحالها لما البوت يشتغل. التسجيل العام (لكل السيرفرات) ممكن ياخذ وقت لين يطلع، فوقت التجربة حط رقم سيرفرك: `bot.guild_id = "123..."` ويطلع على طول. لازم تضيف البوت بصلاحية `applications.commands` (في OAuth2 اختر `bot` و `applications.commands`).

## أزرار تعيش بعد إعادة التشغيل

الأزرار العادية تنسى بعد ما تطفي البوت. لو تبي زر يشتغل دايمًا (زر تحقق مثلًا)، أعطه اسم وسجله:

```eo
bot.component "verify", lambda i {
    i.reply_hidden "تم التحقق ✅"
}

bot.command "setup", lambda msg, args {
    var view = discord.View("اضغط للتحقق")
    var b = view.button "تحقق", none
    b.id = "verify"
    msg.send view
}
```

## Embed

```eo
var e = discord.Embed("العنوان", "النص")
e.field "الاسم", "القيمة"
e.inline "جنب", "بعض"
e.image = "https://..."
e.thumbnail = "https://..."
e.footer = "discord.eo"
e.author = "eo"
e.color = 5793266
msg.reply e
```

`discord.embed(title, text)` القديمة لسا موجودة وترجع قاموس.

---

## أشياء لازم تعرفها

- **كل حدث وكل أمر يشتغل داخل `prc` بحد دقيقة.** لو كودك طلع فيه خطأ، يطبعه والبوت يكمل:
  ```
  [ProcessError: Error (line 20): division by zero]
  ```
- خل الأحداث **سريعة**. وهي شغالة، البوت ما يقدر يرسل نبضات لديسكورد. لو حدث أخذ أكثر من 40 ثانية تقريبًا، ديسكورد يقطع الاتصال، والمكتبة ترجع تتصل لحالها.
- لو انقطع النت أو ديسكورد قفل الاتصال، المكتبة **ترجع تتصل وتكمل من وين وقفت**.
- لو ديسكورد قال "انتظر" (429)، المكتبة تنتظر وتعيد المحاولة.
- **التوكن غلط**: `The token is wrong...` و البوت يوقف. **Intents مو مفعلة**: `Discord refused the intents...`.

## اختبار بدون نت

مجلد `tests` فيه سيرفر ديسكورد وهمي (يحتاج Node.js):

```bash
node tests/run.js path\to\eo.exe
node tests/run_ui.js path\to\eo.exe
node tests/run_guild.js path\to\eo.exe
```
```
sent to Discord: [ 'pong', 'hello world', 'reaction', 'pong', 'embed:Bye' ]
PASS
```

يجرب: الاتصال، النبضات، `ready`، الأوامر، الرياكشن، الـ embed، انتظار 429، خطأ داخل أمر، وإعادة الاتصال.
