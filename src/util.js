
const defaultLength = 16
const defaultCharset = "123567890abcdefghijklmnopqrstuvwxyz"

export function randomString(len, charset) {
    len = len || defaultLength
    charset = charset || defaultCharset
    const charsetLen = charset.length
    let id = ''
    while (id.length < len) id += charset[Math.random() * charsetLen << 0]
    return id
}
