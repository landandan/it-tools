export const codesByCategories: {
  category: string
  codes: {
    code: number
    name: string
    description: string
    type: 'HTTP' | 'WebDav'
  }[]
}[] = [
  {
    category: '1xx informational response',
    codes: [
      {
        code: 100,
        name: 'Continue',
        description: 'Waiting for the client to emit the body of the request.',
        type: 'HTTP',
      },
      {
        code: 101,
        name: 'Switching Protocols',
        description: 'The server has agreed to change protocol.',
        type: 'HTTP',
      },
      {
        code: 102,
        name: 'Processing',
        description: 'The server is processing the request, but no response is available yet.',
        type: 'WebDav',
      },
      {
        code: 103,
        name: 'Early Hints',
        description: 'The server returns some response headers before final HTTP message.',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '2xx success',
    codes: [
      {
        code: 200,
        name: 'OK',
        description: 'Standard response for successful HTTP requests.',
        type: 'HTTP',
      },
      {
        code: 201,
        name: 'Created',
        description: 'The request has been fulfilled, resulting in the creation of a new resource.',
        type: 'HTTP',
      },
      {
        code: 202,
        name: 'Accepted',
        description: 'The request has been accepted for processing, but the processing has not been completed.',
        type: 'HTTP',
      },
      {
        code: 203,
        name: 'Non-Authoritative Information',
        description:
          'The request is successful but the content of the original request has been modified by a transforming proxy.',
        type: 'HTTP',
      },
      {
        code: 204,
        name: 'No Content',
        description: 'The server successfully processed the request and is not returning any content.',
        type: 'HTTP',
      },
      {
        code: 205,
        name: 'Reset Content',
        description: 'The server indicates to reinitialize the document view which sent this request.',
        type: 'HTTP',
      },
      {
        code: 206,
        name: 'Partial Content',
        description: 'The server is delivering only part of the resource due to a range header sent by the client.',
        type: 'HTTP',
      },
      {
        code: 207,
        name: 'Multi-Status',
        description:
          'The message body that follows is an XML message and can contain a number of separate response codes.',
        type: 'WebDav',
      },
      {
        code: 208,
        name: 'Already Reported',
        description:
          'The members of a DAV binding have already been enumerated in a preceding part of the (multistatus) response.',
        type: 'WebDav',
      },
      {
        code: 226,
        name: 'IM Used',
        description:
          'The server has fulfilled a request for the resource, and the response is a representation of the result.',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '3xx redirection',
    codes: [
      {
        code: 300,
        name: 'Multiple Choices',
        description: 'Indicates multiple options for the resource that the client may follow.',
        type: 'HTTP',
      },
      {
        code: 301,
        name: 'Moved Permanently',
        description: 'This and all future requests should be directed to the given URI.',
        type: 'HTTP',
      },
      {
        code: 302,
        name: 'Found',
        description: 'Redirect to another URL. This is an example of industry practice contradicting the standard.',
        type: 'HTTP',
      },
      {
        code: 303,
        name: 'See Other',
        description: 'The response to the request can be found under another URI using a GET method.',
        type: 'HTTP',
      },
      {
        code: 304,
        name: 'Not Modified',
        description:
          'Indicates that the resource has not been modified since the version specified by the request headers.',
        type: 'HTTP',
      },
      {
        code: 305,
        name: 'Use Proxy',
        description:
          'The requested resource is available only through a proxy, the address for which is provided in the response.',
        type: 'HTTP',
      },
      {
        code: 306,
        name: 'Switch Proxy',
        description: 'No longer used. Originally meant "Subsequent requests should use the specified proxy."',
        type: 'HTTP',
      },
      {
        code: 307,
        name: 'Temporary Redirect',
        description:
          'In this case, the request should be repeated with another URI; however, future requests should still use the original URI.',
        type: 'HTTP',
      },
      {
        code: 308,
        name: 'Permanent Redirect',
        description: 'The request and all future requests should be repeated using another URI.',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '4xx client error',
    codes: [
      {
        code: 400,
        name: 'Bad Request',
        description: 'The server cannot or will not process the request due to an apparent client error.',
        type: 'HTTP',
      },
      {
        code: 401,
        name: 'Unauthorized',
        description:
          'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.',
        type: 'HTTP',
      },
      {
        code: 402,
        name: 'Payment Required',
        description:
          'Reserved for future use. The original intention was that this code might be used as part of some form of digital cash or micropayment scheme.',
        type: 'HTTP',
      },
      {
        code: 403,
        name: 'Forbidden',
        description:
          'The request was valid, but the server is refusing action. The user might not have the necessary permissions for a resource.',
        type: 'HTTP',
      },
      {
        code: 404,
        name: 'Not Found',
        description: 'The requested resource could not be found but may be available in the future.',
        type: 'HTTP',
      },
      {
        code: 405,
        name: 'Method Not Allowed',
        description: 'A request method is not supported for the requested resource.',
        type: 'HTTP',
      },
      {
        code: 406,
        name: 'Not Acceptable',
        description:
          'The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.',
        type: 'HTTP',
      },
      {
        code: 407,
        name: 'Proxy Authentication Required',
        description: 'The client must first authenticate itself with the proxy.',
        type: 'HTTP',
      },
      {
        code: 408,
        name: 'Request Timeout',
        description: 'The server timed out waiting for the request.',
        type: 'HTTP',
      },
      {
        code: 409,
        name: 'Conflict',
        description:
          'Indicates that the request could not be processed because of conflict in the request, such as an edit conflict.',
        type: 'HTTP',
      },
      {
        code: 410,
        name: 'Gone',
        description: 'Indicates that the resource requested is no longer available and will not be available again.',
        type: 'HTTP',
      },
      {
        code: 411,
        name: 'Length Required',
        description:
          'The request did not specify the length of its content, which is required by the requested resource.',
        type: 'HTTP',
      },
      {
        code: 412,
        name: 'Precondition Failed',
        description: 'The server does not meet one of the preconditions that the requester put on the request.',
        type: 'HTTP',
      },
      {
        code: 413,
        name: 'Payload Too Large',
        description: 'The request is larger than the server is willing or able to process.',
        type: 'HTTP',
      },
      {
        code: 414,
        name: 'URI Too Long',
        description: 'The URI provided was too long for the server to process.',
        type: 'HTTP',
      },
      {
        code: 415,
        name: 'Unsupported Media Type',
        description: 'The request entity has a media type which the server or resource does not support.',
        type: 'HTTP',
      },
      {
        code: 416,
        name: 'Range Not Satisfiable',
        description: 'The client has asked for a portion of the file, but the server cannot supply that portion.',
        type: 'HTTP',
      },
      {
        code: 417,
        name: 'Expectation Failed',
        description: 'The server cannot meet the requirements of the Expect request-header field.',
        type: 'HTTP',
      },
      {
        code: 418,
        name: 'I\'m a teapot',
        description: 'The server refuses the attempt to brew coffee with a teapot.',
        type: 'HTTP',
      },
      {
        code: 421,
        name: 'Misdirected Request',
        description: 'The request was directed at a server that is not able to produce a response.',
        type: 'HTTP',
      },
      {
        code: 422,
        name: 'Unprocessable Entity',
        description: 'The request was well-formed but was unable to be followed due to semantic errors.',
        type: 'HTTP',
      },
      {
        code: 423,
        name: 'Locked',
        description: 'The resource that is being accessed is locked.',
        type: 'HTTP',
      },
      {
        code: 424,
        name: 'Failed Dependency',
        description: 'The request failed due to failure of a previous request.',
        type: 'HTTP',
      },
      {
        code: 425,
        name: 'Too Early',
        description: 'Indicates that the server is unwilling to risk processing a request that might be replayed.',
        type: 'HTTP',
      },
      {
        code: 426,
        name: 'Upgrade Required',
        description: 'The client should switch to a different protocol such as TLS/1.0.',
        type: 'HTTP',
      },
      {
        code: 428,
        name: 'Precondition Required',
        description: 'The origin server requires the request to be conditional.',
        type: 'HTTP',
      },
      {
        code: 429,
        name: 'Too Many Requests',
        description: 'The user has sent too many requests in a given amount of time.',
        type: 'HTTP',
      },
      {
        code: 431,
        name: 'Request Header Fields Too Large',
        description:
          'The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.',
        type: 'HTTP',
      },
      {
        code: 451,
        name: 'Unavailable For Legal Reasons',
        description:
          'A server operator has received a legal demand to deny access to a resource or to a set of resources that includes the requested resource.',
        type: 'HTTP',
      },
    ],
  },
  {
    category: '5xx server error',
    codes: [
      {
        code: 500,
        name: 'Internal Server Error',
        description:
          'A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.',
        type: 'HTTP',
      },
      {
        code: 501,
        name: 'Not Implemented',
        description:
          'The server either does not recognize the request method, or it lacks the ability to fulfill the request.',
        type: 'HTTP',
      },
      {
        code: 502,
        name: 'Bad Gateway',
        description:
          'The server was acting as a gateway or proxy and received an invalid response from the upstream server.',
        type: 'HTTP',
      },
      {
        code: 503,
        name: 'Service Unavailable',
        description: 'The server is currently unavailable (because it is overloaded or down for maintenance).',
        type: 'HTTP',
      },
      {
        code: 504,
        name: 'Gateway Timeout',
        description:
          'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.',
        type: 'HTTP',
      },
      {
        code: 505,
        name: 'HTTP Version Not Supported',
        description: 'The server does not support the HTTP protocol version used in the request.',
        type: 'HTTP',
      },
      {
        code: 506,
        name: 'Variant Also Negotiates',
        description: 'Transparent content negotiation for the request results in a circular reference.',
        type: 'HTTP',
      },
      {
        code: 507,
        name: 'Insufficient Storage',
        description: 'The server is unable to store the representation needed to complete the request.',
        type: 'HTTP',
      },
      {
        code: 508,
        name: 'Loop Detected',
        description: 'The server detected an infinite loop while processing the request.',
        type: 'HTTP',
      },
      {
        code: 510,
        name: 'Not Extended',
        description: 'Further extensions to the request are required for the server to fulfill it.',
        type: 'HTTP',
      },
      {
        code: 511,
        name: 'Network Authentication Required',
        description: 'The client needs to authenticate to gain network access.',
        type: 'HTTP',
      },
    ],
  },
];

// Localized strings keyed by locale code. The English data above is the source of
// truth and the fallback when a locale has no translation. Fully populated for `zh`
// (the app default language); other locales fall back to English.
export const categoryTranslations: Record<string, Record<string, string>> = {
  zh: {
    '1xx informational response': '1xx 信息性响应',
    '2xx success': '2xx 成功',
    '3xx redirection': '3xx 重定向',
    '4xx client error': '4xx 客户端错误',
    '5xx server error': '5xx 服务器错误',
  },
};

export const codeTranslations: Record<string, Record<number, { name: string; description: string }>> = {
  zh: {
    100: { name: '继续', description: '等待客户端发送请求体。' },
    101: { name: '切换协议', description: '服务器已同意切换协议。' },
    102: { name: '处理中', description: '服务器正在处理请求，但尚未得到响应。' },
    103: { name: '早期提示', description: '服务器在最终 HTTP 消息之前返回部分响应头。' },
    200: { name: '成功', description: '成功 HTTP 请求的标准响应。' },
    201: { name: '已创建', description: '请求已成功处理，并创建了新的资源。' },
    202: { name: '已接受', description: '请求已被接受处理，但处理尚未完成。' },
    203: { name: '非权威信息', description: '请求成功，但原始请求内容已被转换代理修改。' },
    204: { name: '无内容', description: '服务器已成功处理请求，但未返回任何内容。' },
    205: { name: '重置内容', description: '服务器指示重新初始化发送此请求的文档视图。' },
    206: { name: '部分内容', description: '由于客户端发送了范围头，服务器仅传输资源的一部分。' },
    207: { name: '多状态', description: '随后的消息体为 XML 消息，可包含多个独立的响应码。' },
    208: { name: '已报告', description: 'DAV 绑定的成员已在先前（多状态）响应部分中枚举。' },
    226: { name: '使用 IM', description: '服务器已满足资源请求，响应为结果的表示形式。' },
    300: { name: '多项选择', description: '指示客户端可跟随的该资源的多个选项。' },
    301: { name: '永久移动', description: '此请求及以后所有请求都应定向到给定的 URI。' },
    302: { name: '已找到', description: '重定向到另一个 URL。这是业界实践与标准相冲突的例子。' },
    303: { name: '查看其他', description: '可在另一个 URI 下使用 GET 方法找到该请求的响应。' },
    304: { name: '未修改', description: '表示自请求头指定的版本以来，资源未被修改。' },
    305: { name: '使用代理', description: '请求的资源仅可通过代理获取，响应中提供了代理地址。' },
    306: { name: '切换代理', description: '不再使用。原意为“后续请求应使用指定的代理”。' },
    307: { name: '临时重定向', description: '请求应使用另一个 URI 重复，但以后的请求仍应使用原始 URI。' },
    308: { name: '永久重定向', description: '该请求及以后所有请求都应使用另一个 URI 重复。' },
    400: { name: '错误请求', description: '服务器由于明显的客户端错误而无法或不愿处理请求。' },
    401: { name: '未授权', description: '类似于 403 禁止，但专用于需要认证但认证失败或未提供的情况。' },
    402: { name: '需要付款', description: '保留以备将来使用。原意是可能作为某种数字现金或小额支付方案的一部分。' },
    403: { name: '禁止', description: '请求有效，但服务器拒绝执行。用户可能不具备资源的必要权限。' },
    404: { name: '未找到', description: '找不到请求的资源，但将来可能可用。' },
    405: { name: '方法不允许', description: '请求资源不支持该请求方法。' },
    406: { name: '不可接受', description: '根据请求中发送的 Accept 头，所请求资源只能生成不可接受的内容。' },
    407: { name: '需要代理认证', description: '客户端必须先向代理进行认证。' },
    408: { name: '请求超时', description: '服务器在等待请求时超时。' },
    409: { name: '冲突', description: '表示由于请求中的冲突（如编辑冲突），请求无法被处理。' },
    410: { name: '已删除', description: '表示所请求的资源不再可用，且将来也不会再可用。' },
    411: { name: '需要长度', description: '请求未指定其内容长度，而所请求资源要求该长度。' },
    412: { name: '前提条件失败', description: '服务器不满足请求者对该请求设置的前提条件之一。' },
    413: { name: '负载过大', description: '请求大于服务器愿意或能够处理的大小。' },
    414: { name: 'URI 过长', description: '提供的 URI 对于服务器处理来说过长。' },
    415: { name: '不支持的媒体类型', description: '请求实体的媒体类型不被服务器或资源支持。' },
    416: { name: '范围不满足', description: '客户端请求了文件的一部分，但服务器无法提供该部分。' },
    417: { name: '期望失败', description: '服务器无法满足 Expect 请求头字段的要求。' },
    418: { name: '我是一个茶壶', description: '服务器拒绝尝试用茶壶煮咖啡。' },
    421: { name: '错误定向的请求', description: '请求被定向到一台无法产生响应的服务器。' },
    422: { name: '无法处理的实体', description: '请求格式良好，但因语义错误而无法被遵循。' },
    423: { name: '已锁定', description: '正在访问的资源已被锁定。' },
    424: { name: '依赖失败', description: '由于前一个请求失败，该请求失败。' },
    425: { name: '过早', description: '表示服务器不愿意处理可能被重放的请求。' },
    426: { name: '需要升级', description: '客户端应切换到不同的协议，如 TLS/1.0。' },
    428: { name: '需要前提条件', description: '源服务器要求请求必须是条件性的。' },
    429: { name: '请求过多', description: '用户在给定时间内发送了过多请求。' },
    431: { name: '请求头字段过大', description: '服务器不愿意处理该请求，因为单个或所有请求头字段过大。' },
    451: { name: '因法律原因不可用', description: '服务器运营者已收到法律要求，拒绝访问包含所请求资源的一个或多个资源。' },
    500: { name: '内部服务器错误', description: '一个通用错误消息，在遇到意外情况且没有更具体的消息适用时给出。' },
    501: { name: '未实现', description: '服务器要么无法识别该请求方法，要么缺乏满足请求的能力。' },
    502: { name: '错误网关', description: '服务器作为网关或代理，从上游服务器收到了无效响应。' },
    503: { name: '服务不可用', description: '服务器当前不可用（因为过载或停机维护）。' },
    504: { name: '网关超时', description: '服务器作为网关或代理，未从上游服务器及时收到响应。' },
    505: { name: '不支持的 HTTP 版本', description: '服务器不支持请求中使用的 HTTP 协议版本。' },
    506: { name: '变体也在协商', description: '该请求的透明内容协商导致循环引用。' },
    507: { name: '存储空间不足', description: '服务器无法存储完成请求所需的表示。' },
    508: { name: '检测到循环', description: '服务器在处理请求时检测到无限循环。' },
    510: { name: '未扩展', description: '服务器需要满足该请求的进一步扩展。' },
    511: { name: '需要网络认证', description: '客户端需要进行认证以获得网络访问权限。' },
  },
};
