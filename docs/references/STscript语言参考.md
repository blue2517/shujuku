# STscript 语言参考

## 什么是 STscript？

它是一种简单而强大的脚本语言，可以在不需要复杂编码的情况下扩展 SillyTavern 的功能，让您能够：

- 创建迷你游戏或速度挑战
- 构建 AI 驱动的聊天洞察
- 发挥您的创造力并与他人分享

STscript 是使用斜杠命令引擎构建的，利用命令批处理、数据管道、宏和变量。这些概念将在以下文档中描述。

> **提示**：STscript 仍在积极开发中。如果您计划使用其任何功能，建议使用 staging 分支。

---

## 安全预防措施

拥有强大能力意味着承担重大责任。请小心并始终在执行脚本之前进行检查。

---

## 你好，世界！

要运行你的第一个脚本，打开任何 SillyTavern 聊天并在聊天输入框中输入以下内容：

```stscript
/pass Hello, World! | /echo
```

你应该在屏幕顶部的通知中看到消息 `Hello World`。现在让我们逐步解析一下：

1. 脚本是一组命令，每个命令以斜杠开头，可以有命名参数和未命名参数，最后以命令分隔符字符 `|` 结束。
2. 命令按顺序执行，一个接一个，并在彼此之间传递数据。
3. `/pass` 命令接受一个常量值 `"Hello, World!"` 作为未命名参数，并将其写入管道。
4. `/echo` 命令通过管道从前一个命令接收该值，并将其显示为通知。

> **提示**：要查看所有可用命令的列表，请在聊天中输入 `/help slash`。

由于常量未命名参数和管道是可以互换的，我们可以简单地将这个脚本重写为：

```stscript
/echo Hello, World!
```

---

## 用户输入

现在让我们为脚本添加一些互动性。我们将接受用户的输入值并在通知中显示它：

```stscript
/input Enter your name |
/echo Hello, my name is {{pipe}}
```

- `/input` 命令用于显示一个带有未命名参数中指定提示的输入框，然后将输出写入管道。
- 由于 `/echo` 已经有一个未命名参数来设置输出的模板，我们使用 `{{pipe}}` 宏来指定管道值将被渲染的位置。

### 其他输入/输出命令

- `/popup (text)` — 显示一个阻塞弹窗，支持简单的 HTML 格式，例如：`/popup <font color=red>I'm red!</font>`。
- `/setinput (text)` — 用提供的文本替换用户输入栏的内容。
- `/speak voice="name" (text)` — 使用选定的 TTS 引擎和语音映射中的角色名称来朗读文本，例如：`/speak name="Donald Duck" Quack!`。
- `/buttons labels=["a","b"] (text)` — 显示一个带有指定文本和按钮标签的阻塞弹窗。`labels` 必须是一个 JSON 序列化的字符串数组或包含该数组的变量名。返回点击的按钮标签，如果取消则返回空字符串。文本支持简单的 HTML 格式。

### `/popup` 和 `/input` 的参数

`/popup` 和 `/input` 支持以下附加命名参数：

- `large=on/off` - 增加弹窗的垂直大小。默认：`off`。
- `wide=on/off` - 增加弹窗的水平大小。默认：`off`。
- `okButton=string` - 添加自定义“确定”按钮文本的能力。默认：`Ok`。
- `rows=number` - （仅适用于 `/input`）增加输入控件的大小。默认：`1`。

**示例**：
```stscript
/popup large=on wide=on okButton="Accept" Please accept our terms and conditions....
```

### `/echo` 的参数

`/echo` 支持以下值作为附加的 `severity` 参数，以设置显示消息的样式：

- `warning`
- `error`
- `info`（默认）
- `success`

**示例**：
```stscript
/echo severity=error Something really bad happened.
```

---

## 变量

变量用于在脚本中存储和操作数据，可以使用命令或宏。变量可以是以下类型之一：

- **本地变量** — 保存到当前聊天的元数据中，并且是唯一的。
- **全局变量** — 保存到 `settings.json` 中，并在整个应用程序中存在。

### 变量命令与宏

- `/getvar name` 或 `{{getvar::name}}` — 获取本地变量的值。
- `/setvar key=name value` 或 `{{setvar::name::value}}` — 设置本地变量的值。
- `/addvar key=name increment` 或 `{{addvar::name::increment}}` — 将 increment 添加到本地变量的值中。
- `/incvar name` 或 `{{incvar::name}}` — 将本地变量的值增加 1。
- `/decvar name` 或 `{{decvar::name}}` — 将本地变量的值减少 1。
- `/getglobalvar name` 或 `{{getglobalvar::name}}` — 获取全局变量的值。
- `/setglobalvar key=name` 或 `{{setglobalvar::name::value}}` — 设置全局变量的值。
- `/addglobalvar key=name` 或 `{{addglobalvar::name:increment}}` — 将 increment 添加到全局变量的值中。
- `/incglobalvar name` 或 `{{incglobalvar::name}}` — 将全局变量的值增加 1。
- `/decglobalvar name` 或 `{{decglobalvar::name}}` — 将全局变量的值减少 1。
- `/flushvar name` — 删除本地变量的值。
- `/flushglobalvar name` — 删除全局变量的值。

**注意事项**：
1. 之前未定义变量的默认值是一个空字符串，或者在 `/addvar`、`/incvar`、`/decvar` 命令首次使用时为零。
2. `/addvar` 命令中的增量会执行加法或减法，如果增量和变量值都可以转换为数字，否则将执行字符串连接。
3. 如果命令参数接受变量名，并且存在同名的本地变量和全局变量，则 **本地变量优先**。
4. 所有用于变量操作的斜杠命令将结果值写入管道，以供下一个命令使用。
5. 对于宏，只有 `get`、`inc` 和 `dec` 类型的宏返回值，`add` 和 `set` 则替换为空字符串。

**示例**：
```stscript
/input What do you want to generate? |
/setvar key=SDinput |
/echo Requesting an image of {{getvar::SDinput}} |
/getvar SDinput |
/imagine
```
- 用户输入的值保存在名为 `SDinput` 的本地变量中。
- `getvar` 宏用于在 `/echo` 命令中显示该值。
- `getvar` 命令用于检索变量的值并通过管道传递。
- 该值传递给 `/imagine` 命令（由图像生成插件提供），作为其输入提示。
- 由于变量在脚本执行之间被保存而未被清除，因此您可以在其他脚本和宏中引用该变量。若要丢弃该变量，请使用 `/flushvar`。

---

## 数组和对象

变量值可以包含 JSON 序列化的数组或键值对（对象）。

**示例**：
- 数组：`["apple","banana","orange"]`
- 对象：`{"fruits":["apple","banana","orange"]}`

可以对命令进行以下修改，以便处理这些变量：
- `/len` 命令获取数组中的项目数量。
- `index=number/string` 命名参数可以添加到 `/getvar` 或 `/setvar` 及其全局对应命令，以通过零基索引（数组）或字符串键（对象）获取或设置子值。
- 如果在不存在的变量上使用数字索引，则该变量将被创建为空数组 `[]`。
- 如果在不存在的变量上使用字符串索引，则该变量将被创建为空对象 `{}`。
- `/addvar` 和 `/addglobalvar` 命令支持将新值推送到数组类型的变量中。

---

## 流程控制 - 条件语句

您可以使用 `/if` 命令创建条件表达式，根据定义的规则分支执行：

```stscript
/if left=valueA right=valueB rule=comparison else="(command on false)" "(command on true)"
```

**示例**：
```stscript
/input What's your favorite drink? |
/if left={{pipe}} right="black tea" rule=eq else="/echo You shall not pass \| /abort" "/echo Welcome to the club, \{\{user\}\}"
```

### `/if` 的参数

- `left`：第一个操作数（A）。
- `right`：第二个操作数（B）。
- `rule`：要应用于操作数的操作。
- `else`：可选的子命令字符串，如果布尔比较的结果为假，则执行该子命令。
- 未命名参数：布尔比较结果为真时要执行的子命令。

操作数值的评估顺序：
1. 数字字面量
2. 本地变量名
3. 全局变量名
4. 字符串字面量

### 布尔运算规则 (`rule`)

- `eq` (等于) => `A == B`
- `neq` (不等于) => `A != B`
- `lt` (小于) => `A < B`
- `gt` (大于) => `A > B`
- `lte` (小于或等于) => `A <= B`
- `gte` (大于或等于) => `A >= B`
- `not` (一元否定) => `!A`
- `in` (包含子字符串) => `A` 包含 `B`（不区分大小写）
- `nin` (不包含子字符串) => `A` 不包含 `B`（不区分大小写）

### 子命令

子命令是一个包含要执行的斜杠命令列表的字符串。
- 要在子命令中使用命令批处理，命令分隔符字符应被转义（如 `\|`）。
- 由于宏值在条件进入时执行，而不是在子命令执行时执行，因此可以额外转义宏（如 `\{\{pipe\}\}`），以将其评估延迟到子命令执行时。
- 子命令执行的结果被传递给 `/if` 后面的命令。
- `/abort` 命令在遇到时会中断脚本执行。

`/if` 命令可以作为三元运算符使用：
```stscript
/if left=a right=5 rule=eq else="/pass false" "/pass true" |
/echo
```

---

## 转义序列

### 宏
宏的转义方式为转义两个左花括号或成对花括号：
```stscript
/echo \{\{char}} |
/echo \{\{char\}\}
```

### 管道
在闭包中，管道不需要转义（作为命令分隔符使用时）。在你想使用字面量管道字符的地方，需要对其进行转义：
```stscript
/echo title="a\|b" c\|d |
/echo title=a\|b c\|d |
```
使用解析器标志 `STRICT_ESCAPING` 时，你不需要在引用的值中转义管道：
```stscript
/parser-flag STRICT_ESCAPING |
/echo title="a|b" c\|d |
/echo title=a\|b c\|d |
```

### 引用与空格
- 引用值中使用字面量引号必须转义：
  ```stscript
  /echo title="a \"b\" c" d "e" f
  ```
- 命名参数值中使用空格需要加引号或反斜杠转义：
  ```stscript
  /echo title="a b" c d |
  /echo title=a\ b c d
  ```

### 闭包定界符
使用标记闭包开始或结束的字符组合时，用反斜杠转义：
```stscript
/echo \{: |
/echo \:}
```

### 管道分隔符 (`||`)
为了防止前一个命令的输出被自动作为未命名参数注入到下一个命令中，请在两个命令之间放置双管道 `||`：
```stscript
/echo we don't want to pass this on ||
/world
```

---

## 闭包 (Closures)

```stscript
{: ... :}
```

闭包（块语句、lambda、匿名函数）是一系列被 `{: ` 和 ` :}` 包裹的命令，只有在执行代码的那部分时才会被评估。

### 子命令与闭包

闭包使得使用子命令变得更加容易，消除了转义管道和宏的繁琐工作：

```stscript
// 不使用闭包的 if
/if left=1 rule=eq right=1
    else="
        /echo not equal \|
        /return 0
    "
    /echo equal \|
    /return \{\{pipe}}

// 使用闭包的 if
/if left=1 rule=eq right=1
    else={:
        /echo not equal |
        /return 0
    :}
    {:
        /echo equal |
        /return {{pipe}}
    :}
```

### 作用域

闭包具有自己的作用域，并支持作用域变量。作用域变量通过 `/let` 声明，其值通过 `/var` 设置和检索，也可使用 `{{var::}}` 宏：

```stscript
/let x |
/let y 2 |
/var x 1 |
/var y |
/echo x is {{var::x}} and y is {{pipe}}.
```

作用域规则：
- 在闭包内，可以访问在同一闭包或其祖先中声明的所有变量。
- 无法访问在闭包的后代中声明的变量。
- 如果一个变量与在闭包祖先中声明的变量同名，则在子闭包及其后代中将遮蔽祖先变量。

```stscript
/let x this is root x |
/let y this is root y |
/return {:
    /echo called from level-1: x is "{{var::x}}" and y is "{{var::y}}" |
    /delay 500 |
    /let x this is level-1 x |
    /echo called from level-1: x is "{{var::x}}" and y is "{{var::y}}" |
    /delay 500 |
    /return {:
        /echo called from level-2: x is "{{var::x}}" and y is "{{var::y}}" |
        /let x this is level-2 x |
        /echo called from level-2: x is "{{var::x}}" and y is "{{var::y}}" |
        /delay 500
    :}()
:}() |
/echo called from root: x is "{{var::x}}" and y is "{{var::y}}"
```

### 命名闭包

闭包可以被赋值给变量（仅限作用域变量），以便在稍后调用或用作子命令：

```stscript
/let myClosure {:
    /echo this is my closure
:} |
/:myClosure
```

```stscript
/let myClosure {:
    /echo this is my closure |
    /delay 500
:} |
/times 3 {{var::myClosure}}
```

> **提示**：`/:` 也可以用来执行快速回复，它是 `/run` 的简写：
> ```stscript
> /:QrSetName.QrButtonLabel |
> /run QrSetName.QrButtonLabel
> ```

### 闭包参数

命名闭包可以像斜杠命令一样接受命名参数，并支持默认值：

```stscript
/let myClosure {: a=1 b=
    /echo a is {{var::a}} and b is {{var::b}}
:} |
/:myClosure b=10
```

### 立即执行的闭包 (`()`)

```stscript
{: ... :}()
```

闭包可以被立即执行，这意味着它们将被替换为其返回值：

```stscript
// 两个字符串的简单长度比较，无需闭包
/len foo |
/var lenOfFoo {{pipe}} |
/len bar |
/var lenOfBar {{pipe}} |
/if left={{var::lenOfFoo}} rule=eq right={{var:lenOfBar}} /echo yay!

// 使用立即执行的闭包进行相同的比较
/if left={:/len foo:}() rule=eq right={:/len bar:}() /echo yay!
```

---

## 注释

- 单行注释：`// ... |` 或 `/# ...`
- 块注释（暂存功能）：`/* ... *|`

```stscript
// 这是一行注释 |
/echo foo |
/# 这也是一行注释

/*
/echo bar |
/echo foobar |
*|
/echo foo again |
```

---

## 循环控制：`/while` 与 `/times`

### `/while`
```stscript
/while left=valueA right=valueB rule=operation guard=on "commands"
```
- 在循环每一步将 A 与 B 进行比较，若为真则执行引号内的命令。
- `guard=on`（默认）限制循环最大 100 次以防死锁；若需无限循环可设置 `guard=off`。

**示例**：
```stscript
/setvar key=i 0 |
/while left=i right=10 rule=lt "/addvar key=i 1" |
/echo {{getvar::i}} |
/flushvar i
```

### `/times`
以指定的次数运行子命令：
```stscript
/setvar key=i 1 | /times 5 "/addvar key=i 1"
```
- `{{timesIndex}}` 会被替换为当前的迭代索引（从 0 开始）。

### 跳出循环与闭包 (`/break`)

`/break` 命令可用于提前跳出循环 (`/while` 或 `/times`) 或闭包：

```stscript
/times 10 {:
    /echo {{timesIndex}}
    /delay 500 |
    /if left={{timesIndex}} rule=gt right=3 {:
        /break
    :} |
:} |
```

---

## 数学运算

所有数学运算接受一系列数字或变量名，并将结果输出到管道：

| 命令 | 描述 | 示例 |
|---|---|---|
| `/add (a b c ...)` | 多数相加 | `/add 10 i 30 j` |
| `/mul (a b c ...)` | 多数相乘 | `/mul 10 i 30 j` |
| `/max (a b c ...)` | 求最大值 | `/max 1 0 4 k` |
| `/min (a b c ...)` | 求最小值 | `/min 5 4 i 2` |
| `/sub (a b)` | 两数相减 | `/sub i 5` |
| `/div (a b)` | 两数相除 | `/div 10 i` |
| `/mod (a b)` | 取模运算 | `/mod i 2` |
| `/pow (a b)` | 幂运算 | `/pow i 2` |
| `/sin (a)` | 正弦运算 | `/sin i` |
| `/cos (a)` | 余弦运算 | `/cos i` |
| `/log (a)` | 自然对数 | `/log i` |
| `/abs (a)` | 绝对值 | `/abs -10` |
| `/sqrt (a)` | 平方根 | `/sqrt 9` |
| `/round (a)` | 四舍五入到整数 | `/round 3.14` |
| `/rand (round=... from=... to=...)` | 生成指定范围随机数 | `/rand from=5 to=10` |

**综合示例（计算圆面积与阶乘）**：
```stscript
// 计算半径为 50 的圆面积
/setglobalvar key=PI 3.1415 |
/setvar key=r 50 |
/mul r r PI |
/round |
/echo Circle area: {{pipe}}
```

```stscript
// 计算 5 的阶乘
/setvar key=input 5 |
/setvar key=i 1 |
/setvar key=product 1 |
/while left=i right=input rule=lte "/mul product i \| /setvar key=product \| /addvar key=i 1" |
/getvar product |
/echo Factorial of {{getvar::input}}: {{pipe}} |
/flushvar input |
/flushvar i |
/flushvar product
```

---

## 使用 LLM

- `/gen (prompt)` — 使用提供的提示生成文本（基于当前角色与上下文）。
- `/genraw (prompt)` — 纯文本提示生成，忽略当前角色与上下文。
- `/trigger` — 触发正常生成（相当于点击发送按钮）。

**`/genraw` 参数**：
- `lock=on/off`：生成时是否锁定用户输入（默认 `off`）。
- `stop=[]`：JSON 字符串数组，指定自定义 stop 字符串。
- `instruct=on/off`：是否使用指令模板（默认 `on`）。
- `as=system/char`：最后一行提示角色格式。

```stscript
/genraw Write a funny message from Cthulhu about taking over the world. Use emojis. |
/popup <h3>Cthulhu says:</h3><div>{{pipe}}</div>
```

---

## 提示注入 (Prompt Injection)

- `/inject (text)` — 将文本注入到当前聊天的 LLM 提示词中（需指定 `id`）。
- `/listinjects` — 列出当前聊天的所有注入提示。
- `/flushinjects` — 删除当前聊天的所有注入提示。
- `/note (text)` — 设置作者注释 (Author's Note)。
- `/interval` / `/depth` / `/position` — 设置作者注释的间隔、深度与位置。

**`/inject` 示例**：
```stscript
/inject id=IdGoesHere position=chat depth=4 My prompt injection
```
- `position`：`before`（主提示前）、`after`（主提示后，默认）、`chat`（对话历史中）。
- `depth`：在对话中的插入深度（`0` 为末尾，`1` 为倒数第一条前，默认 `4`）。

---

## 对话消息管理

### 读取消息
```stscript
/messages names=on/off start-finish
```
- 范围格式 `start-finish` 是闭区间（包含两端）。
- 获取最近 3 条消息并填入输入框：
  ```stscript
  /setvar key=start {{lastMessageId}} |
  /addvar key=start -2 |
  /messages names=off {{getvar::start}}-{{lastMessageId}} |
  /setinput
  ```

### 发送与修改消息
- `/send (text)` — 以当前用户身份发送消息。
- `/sendas name=charname (text)` — 以指定角色身份发送消息。
- `/sys (text)` — 发送中立系统旁白消息。
- `/comment (text)` — 发送隐藏备注（对 LLM 提示不可见）。
- `/addswipe (text)` — 为最后一条角色消息添加滑动页 (Swipe)。
- `/hide (range)` / `/unhide (range)` — 隐藏 / 取消隐藏指定范围的消息。
- 可选命名参数 `at=number` 指定消息插入的位置（默认为末尾）。

### 删除消息
- `/cut (range)` — 剪切指定消息范围。
- `/del (number)` — 删除最后 N 条消息。
- `/delswipe (swipeId)` — 删除指定滑动页。
- `/delname (name)` — 删除指定角色发送的所有消息。
- `/delchat` — 删除当前聊天。

---

## 世界信息 / 资料库 (World Info / Lorebook)

- `/getchatbook` — 获取或创建绑定到当前聊天的世界信息书。
- `/findentry file=bookName field=fieldName [text]` — 查找条目 UID。
- `/getentryfield file=bookName field=fieldName [UID]` — 获取条目指定字段值。
- `/setentryfield file=bookName uid=UID field=fieldName [text]` — 修改条目指定字段值。
- `/createentry file=bookName key=keyValue [content]` — 创建新条目。

**示例**：
```stscript
/getchatbook | /setvar key=chatLore |
/createentry file=chatLore key="Milla" Milla Basset is a friend of Lilac and Carol. |
/echo
```

---

## 快速回复 (Quick Reply, QR)

### 管理命令
- `/qr-create set=PresetName label=ButtonLabel [commands]` — 创建快速回复按钮。
- `/qr-delete set=PresetName [label]` — 删除快速回复按钮。
- `/qr-update set=PresetName label=ButtonLabel newlabel=NewLabel [commands]` — 更新快速回复。
- `/qr-presetadd slots=3 MyNewPreset` — 新建快速回复预设。
- `/run PresetName.ButtonLabel` — 执行指定预设中的快速回复过程。
