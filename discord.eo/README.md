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

> تحتاج eo 1.9 أو أحدث.

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

# أي حدث من ديسكورد باسمه، ويوصلك كقاموس
bot.on "GUILD_MEMBER_ADD", lambda d {
    print "New member: " + d["user"]["username"]
}
```

| الحدث | المعاملات |
|---|---|
| `"ready"` | بدون: البوت اتصل، و `bot.user` جاهز |
| `"message"` | `msg` (رسالة، حتى رسايل البوتات) |
| أي اسم من [أحداث ديسكورد](https://discord.com/developers/docs/topics/gateway-events) | `d` (قاموس فيه بيانات الحدث كما هي) |

## الأوامر

```eo
bot.prefix = "!"          # الافتراضي

# !say مرحبا يا شباب
bot.command "say", lambda msg, args {
    msg.reply join(args, " ")     # args = ["مرحبا", "يا", "شباب"]
}
```

- اسم الأمر ما يفرق فيه الحرف الكبير والصغير (`!PING` = `!ping`).
- الأوامر ما تشتغل على رسايل البوتات (ولا على البوت نفسه).

## الرسالة `msg`

| الحقل | وش فيه |
|---|---|
| `msg.content` | النص |
| `msg.author` | المرسل: `msg.author.name` و `msg.author.display_name` و `msg.author.id` و `msg.author.bot` |
| `msg.id` ، `msg.channel_id` ، `msg.guild_id` | الأرقام (نصوص). `guild_id` فاضي في الخاص |
| `msg.raw` | كل بيانات الرسالة من ديسكورد كقاموس |

| الـ method | وش تسوي |
|---|---|
| `msg.reply "نص"` | ترد على الرسالة |
| `msg.send "نص"` | ترسل رسالة عادية في نفس القناة |
| `msg.react "👍"` | تحط رياكشن |
| `msg.reply_embed "العنوان", "النص"` | ترد بصندوق مرتب |
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

الافتراضي: `GUILDS` و `GUILD_MESSAGES` و `DIRECT_MESSAGES` و `MESSAGE_CONTENT`. الموجودة: `GUILDS` `GUILD_MEMBERS` `GUILD_MESSAGES` `GUILD_MESSAGE_REACTIONS` `DIRECT_MESSAGES` `MESSAGE_CONTENT`. اللي فيها (Privileged) لازم تفعلها في Developer Portal.

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
```
```
sent to Discord: [ 'pong', 'hello world', 'reaction', 'pong', 'embed:Bye' ]
PASS
```

يجرب: الاتصال، النبضات، `ready`، الأوامر، الرياكشن، الـ embed، انتظار 429، خطأ داخل أمر، وإعادة الاتصال.
