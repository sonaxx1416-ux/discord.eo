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

> تحتاج eo بإصدار فيه `struct` و `http` و `ws_connect` (من بعد eo-language 1.8).

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
| `bot.send channel_id, "نص"` | يرسل رسالة لأي قناة |
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
```
```
sent to Discord: [ 'pong', 'hello world', 'reaction', 'pong', 'embed:Bye' ]
PASS
```

يجرب: الاتصال، النبضات، `ready`، الأوامر، الرياكشن، الـ embed، انتظار 429، خطأ داخل أمر، وإعادة الاتصال.
