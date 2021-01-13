/**
 * cos-nodejs-sdk-v5 类型声明
 */
import { Stream } from 'stream';

/**
 * 定义 COS 命名空间，方便导出用到的变量类型给外部引用
 */
declare namespace COS {

  /** 存储桶的名称，命名规则为 BucketName-APPID，例如 examplebucket-1250000000 */
  type Bucket = string;
  /** 存储桶所在地域 @see https://cloud.tencent.com/document/product/436/6224 */
  type Region = string;
  /** 请求的对象键，最前面不带 /，例如 images/1.jpg */
  type Key = string;
  /** 请求路径，最前面带 /，例如 /images/1.jpg */
  type Pathname = string;
  /** 对象的版本 ID；当未启用版本控制时，该节点的值为空字符串；当启用版本控制时，启用版本控制之前的对象，其版本 ID 为 null；当暂停版本控制时，新上传的对象其版本 ID 为 null，且同一个对象最多只存在一个版本 ID 为 null 的对象版本 */
  type VersionId = string;
  /** 前缀匹配，用来规定返回的文件前缀地址 */
  type Prefix = string;
  /** 分块上传的任务 ID */
  type UploadId = string;
  /** 标识本次分块上传的编号，范围在1 - 10000 */
  type PartNumber = number;
  /** 创建的存储桶访问地址，不带 https:// 前缀，例如 examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com/images/1.jpg */
  type Location = string;
  /** 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，例如"8e0b617ca298a564c3331da28dcb50df"。此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同 */
  type ETag = string;
  /** COS API 使用的时间字符串，为 ISO8601 格式，例如2019-05-24T10:56:40Z */
  type IsoDateTime = string;
  /** 请求里的 Url Query 参数 */
  type Query = object;
  /** 请求里的 Header 参数 */
  type Headers = object;
  /** 一个字符的分隔符，常用 / 字符，用于对对象键进行分组。所有对象键中从 prefix 或从头（如未指定 prefix）到首个 delimiter 之间相同的部分将作为 CommonPrefixes 下的一个 Prefix 节点。被分组的对象键不再出现在后续对象列表中 */
  type Delimiter = '/' | string;
  /** 规定返回值的编码方式，可选值：url，代表返回的对象键为 URL 编码（百分号编码）后的值，例如“腾讯云”将被编码为%E8%85%BE%E8%AE%AF%E4%BA%91 */
  type EncodingType = 'url' | string;
  /** 上传的文件内容 */
  type UploadBody = Buffer | String | Stream;
  /** 下载的文件内容 */
  type GetObjectBody = Buffer | String | Stream;
  /** 对象存储类型。枚举值 STANDARD | STANDARD_IA | ARCHIVE | DEEP_ARCHIVE | INTELLIGENT_TIERING | MAZ_STANDARD | MAZ_STANDARD_IA | MAZ_INTELLIGENT_TIERING @see https://cloud.tencent.com/document/product/436/33417 */
  type StorageClass = 'STANDARD' | 'STANDARD_IA' | 'ARCHIVE' | 'DEEP_ARCHIVE' | 'INTELLIGENT_TIERING' | 'MAZ_STANDARD' | 'MAZ_STANDARD_IA' | 'MAZ_INTELLIGENT_TIERING';
  /** 请求方法 */
  type Method = 'GET' | 'DELETE' | 'POST' | 'PUT' | 'OPTIONS' | 'get' | 'delete' | 'post' | 'put' | 'options';
  /** 权限信息，枚举值：READ | WRITE | READ_ACP | WRITE_ACP | FULL_CONTROL 腾讯云对象存储 COS 在资源 ACL 上支持的操作实际上是一系列的操作集合，对于存储桶和对象 ACL 来说分别代表不同的含义。 */
  type Permission = 'READ' | 'WRITE' | 'READ_ACP' | 'WRITE_ACP' | 'FULL_CONTROL';
  /** 存储桶的预设 ACL @see https://cloud.tencent.com/document/product/436/30752#.E9.A2.84.E8.AE.BE.E7.9A.84-acl */
  type BucketACL = 'private' | 'public-read' | 'public-read-write' | 'authenticated-read';
  /** 对象的预设 ACL @see https://cloud.tencent.com/document/product/436/30752#.E9.A2.84.E8.AE.BE.E7.9A.84-acl */
  type ObjectACL = 'default' | 'private' | 'public-read' | 'authenticated-read' | 'bucket-owner-read' | 'bucket-owner-full-contro';
  /** 二进制值的字符串，'true' | 'false' */
  type BooleanString = 'true' | 'false';
  /** 所有者的信息 */
  type Owner = {
    /** 存储桶持有者的完整 ID，格式为 qcs::cam::uin/[OwnerUin]:uin/[OwnerUin]，如 qcs::cam::uin/100000000001:uin/100000000001 */
    ID: string,
    /** 存储桶持有者的名字 */
    DisplayName: string
  };
  /** 上传发起者的信息 */
  type Initiator = Owner;
  /** 单个授权信息 */
  type Grant = string;
  /** 被授权者信息与权限信息 */
  interface Grants {
    /** 所有者的信息 */
    Grantee: Owner,
    /** 权限信息，枚举值：READ | WRITE | READ_ACP | WRITE_ACP | FULL_CONTROL 腾讯云对象存储 COS 在资源 ACL 上支持的操作实际上是一系列的操作集合，对于存储桶和对象 ACL 来说分别代表不同的含义。 */
    Permission: Permission,
  }
  /** 存储桶/对象标签信息 */
  interface Tag {
    /** 标签的 Key，长度不超过128字节, 支持英文字母、数字、空格、加号、减号、下划线、等号、点号、冒号、斜线 */
    Key: Key,
    /** 标签的 Value，长度不超过256字节, 支持英文字母、数字、空格、加号、减号、下划线、等号、点号、冒号、斜线 */
    Value: string,
  }
  /** 用来说明本次分块上传中每个块的信息 */
  interface Part {
    /** 标识本次分块上传的编号，范围在1 - 10000 */
    PartNumber: PartNumber,
    /** 使用 Upload Part 请求上传分块成功后返回的 ETag 响应头部的值 */
    ETag: ETag,
  }
  /** 当前需要用凭证的请求，需要的最小权限 */
  type Scope = {
    /** 需要的权限 */
    action: string,
    /** 操作的存储桶的名称，命名规则为 BucketName-APPID，例如 examplebucket-1250000000 */
    bucket: Bucket,
    /** 存储桶所在地域 @see https://cloud.tencent.com/document/product/436/6224 */
    region: Region,
    /** 前缀匹配，用来规定返回的文件前缀地址，支持 * 结尾 */
    prefix: Prefix
  }[];
  /** onProgress 回调的进度信息 */
  interface ProgressInfo {
    /** 已上传/下载的字节数，单位 B（字节）  */
    loaded: number,
    /** 要上传/下载的文件的大小，单位 B（字节）  */
    total: number,
    /** 速度，单位 B/s  */
    speed: number,
    /** 进度百分比，范围是 0-1，保留两位小数  */
    percent: number,
  }
  /** 上传/下载的进度回调方法 */
  type onProgress = (params: ProgressInfo) => any;

  // 实例参数
  interface COSOptions {
    /** 固定密钥的 SecretId @see https://console.cloud.tencent.com/cam/capi */
    SecretId?: string,
    /** 固定密钥的 SecretKey  @see https://console.cloud.tencent.com/cam/capi */
    SecretKey?: string,
    /** 如果传入 SecretId、SecretKey 是临时密钥，需要再传入一个临时密钥的 sessionToken */
    XCosSecurityToken?: string,
    /** 分块上传及分块复制时，出错重试次数，默认值3（加第一次，请求共4次） */
    ChunkRetryTimes?: number,
    /** 同一个实例下上传的文件并发数，默认值3 */
    FileParallelLimit?: number,
    /** 同一个上传文件的分块并发数，默认值3 */
    ChunkParallelLimit?: number,
    /** 分块上传时，每片的字节数大小，默认值1048576（1MB） */
    ChunkSize?: number,
    /** 使用 uploadFiles 批量上传时，文件大小大于该数值将使用按分块上传，否则将调用简单上传，单位 Byte，默认值1048576（1MB） */
    SliceSize?: number,
    /** 进行分块复制操作中复制分块上传的并发数，默认值20 */
    CopyChunkParallelLimit?: number,
    /** 使用 sliceCopyFile 分块复制文件时，每片的大小字节数，默认值10485760（10MB） */
    CopyChunkSize?: number,
    /** 使用 sliceCopyFile 分块复制文件时，文件大小大于该数值将使用分块复制 ，否则将调用简单复制，默认值10485760（10MB） */
    CopySliceSize?: number,
    /** 最大分片数，默认 1000，最大 10000，分片上传超大文件时，会根据文件大小和该最大分片数计算合适的的分片大小 */
    MaxPartNumber?: number,
    /** 上传进度的回调方法 onProgress 的回调频率，单位 ms ，默认值1000 */
    ProgressInterval?: number,
    /** 上传队列最长大小，超出的任务如果状态不是 waiting、checking、uploading 会被清理，默认10000 */
    UploadQueueSize?: number,
    /** 上传队列最长大小，超出的任务如果状态不是 waiting、checking、uploading 会被清理，默认10000 */
    Domain?: string,
    /** 强制使用后缀式模式发请求。后缀式模式中 Bucket 会放在域名后的 pathname 里，并且 Bucket 会加入签名 pathname 计算，默认 false */
    ServiceDomain?: string,
    /** 强制使用后缀式模式发请求。后缀式模式中 Bucket 会放在域名后的 pathname 里，并且 Bucket 会加入签名 pathname 计算，默认 false */
    Protocol?: string,
    /** 开启兼容模式，默认 false 不开启，兼容模式下不校验 Region 是否格式有误，在用于私有化 COS 时使用 */
    CompatibilityMode?: boolean,
    /** 强制使用后缀式模式发请求。后缀式模式中 Bucket 会放在域名后的 pathname 里，并且 Bucket 会加入签名 pathname 计算，默认 false */
    ForcePathStyle?: boolean,
    /** 是否原样保留 Key 字段的 / 前缀，默认 false 不保留，这时如果 Key 是 / 开头，强制去掉第一个 / */
    UseRawKey?: boolean,
    /** 请求超时时间，单位 ms(毫秒)，透传给 request 或 ajax 或小程序请求库 */
    Timeout?: number,
    /** 客户端时间是否不准确，默认 false，在第一次请求 COS API 返回时会判断是否偏差大于 30s，如果是会把该值设置为 true，开发者也可以预先判断并设置该参数 */
    CorrectClockSkew?: boolean,
    /** 校正时间的偏移值，单位 ms(毫秒)，计算签名时会用设备当前时间戳加上该偏移值，在设备时间有误时可用于校正签名用的时间参数，在第一次请求 COS API 返回时会判断是否偏差大于 30s，如果是会把该值设置为 true，开发者也可以预先判断并设置该参数。 */
    SystemClockOffset?: number,
    /** 上传文件时校验 Content-MD5，默认 false。如果开启，上传文件时会对文件内容计算 MD5，大文件耗时较长 */
    UploadCheckContentMd5?: boolean,
    /** 上传文件时计算文件内容 md5 并设置为文件 x-cos-meta-md5 元数据 Header 字段 */
    UploadAddMetaMd5?: boolean,
    /** 分片上传缓存的 UploadId 列表大小限制，nodejs-sdk 默认 500 个，js-sdk 默认 50 */
    UploadIdCacheLimit?: number,
    /** 分片上传缓存的 UploadId 列表时，保存的本地缓存文件目录路径，nodejs-sdk 默认 500 个，js-sdk 默认 50 */
    ConfCwd?: string,
    /** 获取签名的回调方法，如果没有 SecretId、SecretKey 时，这个参数必选 */
    getAuthorization?: (
        options: GetAuthorizationOptions,
        callback: (
            params: GetAuthorizationCallbackParams
        ) => void
    ) => void,
  }

  interface StaticGetAuthorizationOptions {
    /** 计算签名用的密钥 SecretId，必须 */
    SecretId: string,
    /** 计算签名用的密钥 SecretKey，必须 */
    SecretKey: string,
    /** 请求方法，可选 */
    Method?: Method,
    /** 请求路径，最前面带 /，例如 /images/1.jpg，可选 */
    Pathname?: Pathname,
    /** 要参与签名计算的 Url Query 参数，可选 */
    Query?: Query,
    /** 要参与签名计算的 Header 参数，可选 */
    Headers?: Headers,
    /** 校正时间的偏移值，单位 ms(毫秒)，计算签名时会用设备当前时间戳加上该偏移值，在设备时间有误时可用于校正签名用的时间参数。 */
    SystemClockOffset?: number,
  }
  interface GetAuthorizationOptions {
    /** 存储桶的名称，格式为<bucketname-appid>，例如examplebucket-1250000000 */
    Bucket: Bucket,
    /** 存储桶所在地域 @see https://cloud.tencent.com/document/product/436/6224 */
    Region: Region,
    /** 请求方法 */
    Method: Method,
    /** 请求路径，最前面带 /，例如 /images/1.jpg，Pathname 和 Key 二选一 */
    Pathname: Pathname,
    /** 请求的对象键，最前面不带 /，例如 images/1.jpg，如果是存储桶接口，传入空字符串，Key 和 Pathname 二选一，推荐使用 Pathname 参数 */
    Key: Key,
    /** 请求里的 Url Query 参数，可选 */
    Query: Query,
    /** 请求里的 Header 参数，可选 */
    Headers: Headers,
    /** 当前需要用凭证的请求，需要的最小权限 */
    Scope: Scope,
    /** 校正时间的偏移值，单位 ms(毫秒)，计算签名时会用设备当前时间戳加上该偏移值，在设备时间有误时可用于校正签名用的时间参数。 */
    SystemClockOffset: number,
  }
  interface Credentials {
    /** 临时密钥 tmpSecretId */
    TmpSecretId: string,
    /** 临时密钥 tmpSecretKey */
    TmpSecretKey: string,
    /** 临时密钥 sessonToken */
    XCosSecurityToken: string,
    /** 获取临时密钥时，服务端的时间，该时间用于计算签名，可以避免设备时间有偏差导致请求错误 */
    StartTime: number,
    /** 获取临时密钥的过期时间戳 */
    ExpiredTime: number,
    /** 该临时密钥是否仅用于相同 Scope 权限范围的请求 */
    ScopeLimit?: boolean,
  }

  /** 签名 */
  type Authorization = string;
  type GetAuthorizationCallbackParams = Authorization | Credentials;
  type CosError = null | {
    /** 请求返回的 HTTP 状态码 */
    statusCode?: number,
    /** 请求返回的 header 字段 */
    headers?: Headers,
    /** 错误信息，可能是参数错误、客户端出错、或服务端返回的错误 */
    error: string | Error | { Code: string, Message: string }
  }
  interface GeneralResult {
    /** 请求返回的 HTTP 状态码 */
    statusCode?: number,
    /** 请求返回的 header 字段 */
    headers?: Headers,
  }
  interface BucketParams {
    /** 存储桶的名称，格式为<bucketname-appid>，例如examplebucket-1250000000 */
    Bucket: Bucket,
    /** 存储桶所在地域 @see https://cloud.tencent.com/document/product/436/6224 */
    Region: Region,
    /** 请求时带上的 Header 字段 */
    Headers?: Headers,
  }
  interface ObjectParams {
    /** 存储桶的名称，格式为<bucketname-appid>，例如examplebucket-1250000000 */
    Bucket: Bucket,
    /** 存储桶所在地域，如果有传入只返回该地域的存储桶列表 */
    Region: Region,
    /** 请求的对象键，最前面不带 / */
    Key: Key,
    /** 发请求时带上的 Header 字段 */
    Headers?: Headers,
  }

  // 所有接口的入参和出参
  // getService
  interface GetServiceParams {
    /** 存储桶所在地域，如果传入只返回该地域的存储桶 */
    Region?: Region,
    /** 发请求时带上的 Header 字段 */
    Headers?: Headers,
  }
  /** getService 接口返回值 */
  interface GetServiceResult extends GeneralResult {
    Buckets: {
      /** 存储桶的名称，格式为<bucketname-appid>，例如examplebucket-1250000000 */
      Name: Bucket,
      /** 存储桶所在地域 */
      Location: Region,
      /** 存储桶创建时间 */
      CreationDate: IsoDateTime,
    }[],
    Owner: Owner,
  }

  // putBucket
  /** putBucket 接口参数 */
  interface PutBucketParams extends BucketParams {
    /** 允许用户自定义存储桶权限，有效值：private | public-read | public-read-write，可选 */
    ACL?: BucketACL,
    /** 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantRead?: Grant,
    /** 赋予被授权者写取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantWrite?: Grant,
    /** 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantReadAcp?: Grant,
    /** 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantWriteAcp?: Grant,
    /** 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantFullControl?: Grant,
    /** 要创建存储桶的AZ类型，创建多AZ存储桶，传入 'MAZ' */
    BucketAZConfig?: 'MAZ' | string,
  }
  /** putBucket 接口返回值 */
  interface PutBucketResult extends GeneralResult {
    /** 创建的存储桶访问地址，不带 https:// 前缀，例如 examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com/ */
    Location: Location
  }

  // headBucket
  /** headBucket 接口参数 */
  interface HeadBucketParams extends BucketParams {}
  /** headBucket 接口返回值 */
  interface HeadBucketResult extends GeneralResult {}

  // getBucket
  /** getBucket 接口参数 */
  interface GetBucketParams extends BucketParams {
    /** 前缀匹配，用来规定返回的文件前缀地址，必须 */
    Prefix: Prefix,
    /** 一个字符的分隔符，常用 / 字符，用于对对象键进行分组。所有对象键中从 prefix 或从头（如未指定 prefix）到首个 delimiter 之间相同的部分将作为 CommonPrefixes 下的一个 Prefix 节点。被分组的对象键不再出现在后续对象列表中，可选 */
    Delimiter?: Delimiter,
    /** 默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，可选 */
    Marker?: Key,
    /** 单次返回最大的条目数量，默认值为1000，最大为1000，注意：该参数会限制每一次 List 操作返回的最大条目数，COS 在每次 List 操作中将返回不超过 max-keys 所设定数值的条目（即 CommonPrefixes 和 Contents 的总和），如果单次响应中未列出所有对象，COS 会返回 NextMarker 节点，其值作为您下次 List 请求的 marker 参数，以便您列出后续对象，可选 */
    MaxKeys?: number,
    /** 规定返回值的编码方式，可选值：url，代表返回的对象键为 URL 编码（百分号编码）后的值，例如“腾讯云”将被编码为%E8%85%BE%E8%AE%AF%E4%BA%91 */
    EncodingType?: EncodingType,
  }
  /** 对象信息 */
  interface CosObject {
    /** 对象键 */
    Key: Key,
    /** 当前版本的最后修改时间，为 ISO8601 格式，例如2019-05-24T10:56:40Z */
    LastModified: IsoDateTime,
    /** 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，例如“8e0b617ca298a564c3331da28dcb50df”，此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同 */
    ETag: ETag,
    /** 对象大小，单位为 Byte */
    Size: string,
    /** 对象存储类型。枚举值 STANDARD | STANDARD_IA | ARCHIVE | DEEP_ARCHIVE | INTELLIGENT_TIERING | MAZ_STANDARD | MAZ_STANDARD_IA | MAZ_INTELLIGENT_TIERING @see https://cloud.tencent.com/document/product/436/33417 */
    StorageClass: StorageClass,
    /** 当对象存储类型为智能分层存储时，指示对象当前所处的存储层，枚举值：FREQUENT（标准层），INFREQUENT（低频层）。仅当 StorageClass 为 INTELLIGENT_TIERING（智能分层）时才会返回该节点 */
    StorageTier?: string,
    /** 对象持有者信息 */
    Owner: Owner,
  }
  /** getBucket 接口返回值 */
  interface GetBucketResult extends GeneralResult {
    /** 对象条目 */
    Contents: CosObject[]
    /** 从 prefix 或从头（如未指定 prefix）到首个 delimiter 之间相同的部分，定义为 Common Prefix。仅当请求中指定了 delimiter 参数才有可能返回该节点 */
    CommonPrefixes: {
      /** 前缀匹配，用来规定返回的文件前缀地址 */
      Prefix: Prefix,
    }[],
    /** 响应条目是否被截断，布尔值，例如 true 或 false，可用于判断是否还需要继续列出文件 */
    IsTruncated: BooleanString,
    /** 仅当响应条目有截断（IsTruncated 为 true）才会返回该节点，该节点的值为当前响应条目中的最后一个对象键，当需要继续请求后续条目时，将该节点的值作为下一次请求的 marker 参数传入 */
    NextMarker?: string,
  }

  // listObjectVersions
  /** listObjectVersions 接口参数 */
  interface ListObjectVersionsParams extends BucketParams {
    /** 前缀匹配，用来规定返回的文件前缀地址，必须 */
    Prefix: Prefix,
    /** 一个字符的分隔符，常用 / 字符，用于对对象键进行分组。所有对象键中从 prefix 或从头（如未指定 prefix）到首个 delimiter 之间相同的部分将作为 CommonPrefixes 下的一个 Prefix 节点。被分组的对象键不再出现在后续对象列表中，可选 */
    Delimiter?: Delimiter,
    /** 默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，可选 */
    Marker?: string,
    /** 单次返回最大的条目数量，默认值为1000，最大为1000，注意：该参数会限制每一次 List 操作返回的最大条目数，COS 在每次 List 操作中将返回不超过 max-keys 所设定数值的条目（即 CommonPrefixes 和 Contents 的总和），如果单次响应中未列出所有对象，COS 会返回 NextMarker 节点，其值作为您下次 List 请求的 marker 参数，以便您列出后续对象，可选 */
    MaxKeys?: string,
    /** 起始版本 ID 标记，从该标记之后（不含）返回对象版本条目，对应请求中的 url 参数 version-id-marker */
    VersionIdMarker?: string,
    /** 规定返回值的编码方式，可选值：url，代表返回的对象键为 URL 编码（百分号编码）后的值，例如“腾讯云”将被编码为%E8%85%BE%E8%AE%AF%E4%BA%91 */
    EncodingType?: EncodingType,
  }
  /** 对象删除标记条目 */
  interface DeleteMarker {
    /** 对象键 */
    Key: Key,
    /** 对象的版本 ID；当未启用版本控制时，该节点的值为空字符串；当启用版本控制时，启用版本控制之前的对象，其版本 ID 为 null；当暂停版本控制时，新上传的对象其版本 ID 为 null，且同一个对象最多只存在一个版本 ID 为 null 的对象版本 */
    VersionId: VersionId,
    /** 当前版本是否为该对象的最新版本 */
    IsLatest: string,
    /** 当前版本的最后修改时间，为 ISO8601 格式，例如2019-05-24T10:56:40Z */
    LastModified: IsoDateTime,
    Owner: Owner,
  }
  interface ObjectVersion {
    /** 对象键 */
    Key: Key,
    /** 对象的删除标记的版本 ID */
    VersionId: VersionId,
    /** 当前版本是否为该对象的最新版本 */
    IsLatest: BooleanString,
    /** 当前版本的最后修改时间，为 ISO8601 格式，例如2019-05-24T10:56:40Z */
    LastModified: IsoDateTime,
    /** 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，例如"8e0b617ca298a564c3331da28dcb50df"。此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同 */
    ETag: ETag,
    /** 对象大小，单位为 Byte */
    Size: string,
    /** 对象大小，单位为 Byte */
    Owner: Owner,
    /** 对象存储类型。枚举值 STANDARD | STANDARD_IA | ARCHIVE | DEEP_ARCHIVE | INTELLIGENT_TIERING | MAZ_STANDARD | MAZ_STANDARD_IA | MAZ_INTELLIGENT_TIERING @see https://cloud.tencent.com/document/product/436/33417 */
    StorageClass: StorageClass,
    /** 当对象存储类型为智能分层存储时，指示对象当前所处的存储层，枚举值：FREQUENT（标准层），INFREQUENT（低频层）。仅当 StorageClass 为 INTELLIGENT_TIERING（智能分层）时才会返回该节点 */
    StorageTier?: string,
  }
  /** listObjectVersions 接口返回值 */
  interface ListObjectVersionsResult extends GeneralResult {
    /** 从 prefix 或从头（如未指定 prefix）到首个 delimiter 之间相同的部分，定义为 Common Prefix。仅当请求中指定了 delimiter 参数才有可能返回该节点 */
    CommonPrefixes: {
      /** 前缀匹配，用来规定返回的文件前缀地址 */
      Prefix: Prefix,
    }[],
    /** 对象版本条目 */
    Versions: ObjectVersion[],
    /** 对象删除标记条目 */
    DeleteMarkers: DeleteMarker[],
    /** 响应条目是否被截断，布尔值，例如 true 或 false，可用于判断是否还需要继续列出文件 */
    IsTruncated: BooleanString,
    /** 仅当响应条目有截断（IsTruncated 为 true）才会返回该节点，该节点的值为当前响应条目中的最后一个对象键，当需要继续请求后续条目时，将该节点的值作为下一次请求的 marker 参数传入 */
    NextMarker?: string,
    /** 仅当响应条目有截断（IsTruncated 为 true）才会返回该节点，该节点的值为当前响应条目中的最后一个对象的版本 ID，当需要继续请求后续条目时，将该节点的值作为下一次请求的 version-id-marker 参数传入。该节点的值可能为空，此时下一次请求的 version-id-marker 参数也需要指定为空。 */
    NextVersionIdMarker?: string,
  }

  // deleteBucket
  /** deleteBucket 接口参数 */
  interface DeleteBucketParams extends BucketParams {}
  /** deleteBucket 接口返回值 */
  interface DeleteBucketResult extends GeneralResult {}

  // putBucketAcl
  /** putBucketAcl 接口参数 */
  interface PutBucketAclParams extends BucketParams {
    /** 允许用户自定义存储桶权限，有效值：private | public-read | public-read-write，可选 */
    ACL?: BucketACL,
    /** 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantRead?: Grant,
    /** 赋予被授权者写取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantWrite?: Grant,
    /** 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantReadAcp?: Grant,
    /** 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantWriteAcp?: Grant,
    /** 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantFullControl?: Grant,
  }
  /** putBucketAcl 接口返回值 */
  interface PutBucketAclResult extends GeneralResult {}

  // getBucketAcl
  /** getBucketAcl 接口参数 */
  interface GetBucketAclParams extends BucketParams {}
  /** getBucketAcl 接口返回值 */
  interface GetBucketAclResult extends GeneralResult {
    /** 允许用户自定义存储桶权限，有效值：private | public-read | public-read-write */
    ACL: BucketACL,
    /** 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者 */
    GrantRead: Grant,
    /** 赋予被授权者写取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者 */
    GrantWrite: Grant,
    /** 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者 */
    GrantReadAcp: Grant,
    /** 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者 */
    GrantWriteAcp: Grant,
    /** 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者 */
    GrantFullControl: Grant,
    /** 存储桶持有者信息 */
    Owner: Owner,
    /** 被授权者信息与权限信息 */
    Grants: Grants,
  }

  // putBucketCors
  type CORSRule = {
    /** 允许的访问来源，单条 CORSRule 可以配置多个 AllowedOrigin。
配置支持 *，表示全部域名都允许，但不推荐。
支持单个具体域名，例如 http://www.example.com。
支持 * 通配符，通配符可出现在任何位置，包括协议、域名和端口，可匹配0个或多个字符，但是只能有一个 *。请谨慎使用通配符，因为可能意外匹配到非预期的来源
注意不要遗漏协议名 http 或 https，若端口不是默认的80(http)或443(https)，还需要带上端口，例如 https://example.com:8443。 */
    AllowedOrigin: string[],
    /** 允许的 HTTP 操作方法（Method），对应 CORS 请求响应中的 Access-Control-Allow-Methods 头部，单条 CORSRule 可以配置多个 AllowedMethod。枚举值：PUT、GET、POST、DELETE、HEAD。 */
    AllowedMethod: string[],
    /** 在发送预检（OPTIONS）请求时，浏览器会告知服务端接下来的正式请求将使用的自定义 HTTP 请求头部，此配置用于指定允许浏览器发送 CORS 请求时携带的自定义 HTTP 请求头部，不区分英文大小写，单条 CORSRule 可以配置多个 AllowedHeader。
可以配置*，代表允许所有头部，为了避免遗漏，推荐配置为*。
如果不配置为*，那么在预检（OPTIONS）请求中 Access-Control-Request-Headers 头部出现的每个 Header，都必须在 AllowedHeader 中有对应项。 */
    AllowedHeader?: string[],
    /** 允许浏览器获取的 CORS 请求响应中的头部，不区分大小写，单条 CORSRule 可以配置多个 ExposeHeader。
默认情况下浏览器只能访问简单响应头部：Cache-Control、Content-Type、Expires、Last-Modified，如果需要访问其他响应头部，需要添加 ExposeHeader 配置。
不支持配置为 *，必须明确配置具体的 Header。
根据浏览器的实际需求确定，默认推荐填写 ETag，可参考各 API 文档的响应头部分及 公共响应头部 文档。@see https://cloud.tencent.com/document/product/436/7729 */
    ExposeHeader?: string[],
    /** 跨域资源共享配置的有效时间，单位为秒，在有效时间内，浏览器无须为同一请求再次发起预检（OPTIONS）请求，对应 CORS 请求响应中的 Access-Control-Max-Age 头部，单条 CORSRule 只能配置一个 MaxAgeSeconds。 */
    MaxAgeSeconds?: number,
  };
  /** putBucketCors 接口参数 */
  interface PutBucketCorsParams extends BucketParams {
    /** 存储桶跨域资源共享（CORS）访问控制规则 */
    CORSRules: CORSRule[]
  }
  /** putBucketCors 接口返回值 */
  interface PutBucketCorsResult extends GeneralResult {
    /** 存储桶跨域资源共享（CORS）访问控制规则 */
    CORSRules: object,
  }

  // getBucketCors
  /** getBucketCors 接口参数 */
  interface GetBucketCorsParams extends BucketParams {}
  /** getBucketCors 接口返回值 */
  interface GetBucketCorsResult extends GeneralResult {}

  // deleteBucketCors
  /** deleteBucketCors 接口参数 */
  interface DeleteBucketCorsParams extends BucketParams {}
  /** deleteBucketCors 接口返回值 */
  interface DeleteBucketCorsResult extends GeneralResult {}

  // getBucketLocation
  interface GetBucketLocationResult {
    /** 存储桶所在地域 */
    LocationConstraint: Region,
  }
  /** getBucketLocation 接口参数 */
  interface GetBucketLocationParams extends BucketParams {}

  // putBucketPolicy
  type PolicyStatement = {
    effect: 'allow' | 'deny',
    principal: object,
    action: string[],
    resource: string[],
    condition?: object,
  }
  interface Policy {
    Statement: PolicyStatement[],
    version: string,
  }
  /** putBucketPolicy 接口参数 */
  interface PutBucketPolicyParams extends BucketParams {
    /** 存储桶的权限策略 */
    Policy: Policy,
  }
  /** putBucketPolicy 接口返回值 */
  interface PutBucketPolicyResult extends GeneralResult {}

  // getBucketPolicy
  /** getBucketPolicy 接口参数 */
  interface GetBucketPolicyParams extends BucketParams {}
  /** getBucketPolicy 接口返回值 */
  interface GetBucketPolicyResult extends GeneralResult {
    /** 存储桶的权限策略 */
    Policy: Policy
  }

  // deleteBucketPolicy
  /** deleteBucketPolicy 接口参数 */
  interface DeleteBucketPolicyParams extends BucketParams {}
  /** deleteBucketPolicy 接口返回值 */
  interface DeleteBucketPolicyResult extends GeneralResult {}

  // putBucketTagging
  /** putBucketTagging 接口参数 */
  interface PutBucketTaggingParams extends BucketParams {
    /** 标签集合，最多支持10个标签 */
    Tags: Tag[],
  }
  /** putBucketTagging 接口返回值 */
  interface PutBucketTaggingResult extends GeneralResult {}

  // getBucketTagging
  /** getBucketTagging 接口返回值 */
  interface GetBucketTaggingResult extends GeneralResult {
    /** 标签集合，最多支持10个标签 */
    Tags: Tag[]
  }

  // deleteBucketTagging
  /** deleteBucketTagging 接口参数 */
  interface DeleteBucketTaggingParams extends BucketParams {}
  /** deleteBucketTagging 接口返回值 */
  interface DeleteBucketTaggingResult extends GeneralResult {}

  // putBucketLifecycle
  /** 生命周期配置规则 */
  type LifecycleRule = {
    ID: '2',
    Status: 'Enabled' | 'Disabled',
    Filter?: object,
    Transition?: object,
    Expiration?: object,
    AbortIncompleteMultipartUpload?: object,
    NoncurrentVersionExpiration?: object,
    NoncurrentVersionTransition?: object,
  };
  /** putBucketLifecycle 接口参数 */
  interface PutBucketLifecycleParams extends BucketParams {
    /** 生命周期配置规则列表 */
    Rules: LifecycleRule[],
  }
  /** putBucketLifecycle 接口返回值 */
  interface PutBucketLifecycleResult extends GeneralResult {}

  // getBucketLifecycle
  /** getBucketLifecycle 接口参数 */
  interface GetBucketLifecycleParams extends BucketParams {}
  /** getBucketLifecycle 接口返回值 */
  interface GetBucketLifecycleResult extends GeneralResult {
    /** 生命周期配置规则列表 */
    Rules: LifecycleRule[]
  }

  // deleteBucketLifecycle
  /** deleteBucketLifecycle 接口参数 */
  interface DeleteBucketLifecycleParams extends BucketParams {}
  /** deleteBucketLifecycle 接口返回值 */
  interface DeleteBucketLifecycleResult extends GeneralResult {}

  // putBucketVersioning
  /** 存储桶版本控制开关信息 */
  interface VersioningConfiguration {
    Status: 'Enabled' | 'Suspended',
  }
  /** putBucketVersioning 接口参数 */
  interface PutBucketVersioningParams extends BucketParams {
    /** 存储桶版本控制开关信息 */
    VersioningConfiguration,
  }
  /** putBucketVersioning 接口返回值 */
  interface PutBucketVersioningResult extends GeneralResult {}

  // getBucketVersioning
  /** getBucketVersioning 接口参数 */
  interface GetBucketVersioningParams extends BucketParams {}
  /** getBucketVersioning 接口返回值 */
  interface GetBucketVersioningResult extends GeneralResult {
    /** 存储桶版本控制开关信息 */
    VersioningConfiguration,
  }

  // putBucketReplication
  interface ReplicationRule {
    ID?: string,
    Status: 'Enabled' | 'Disabled',
    /** 前缀匹配，用来规定返回的文件前缀地址 */
    Prefix: Prefix,
    /** 目标存储桶信息 */
    Destination: {
      /** 资源标识符：qcs::cos:<region>::<bucketname-appid> */
      Bucket: string,
      /** 存储类型，枚举值：STANDARD，INTELLIGENT_TIERING，STANDARD_IA 等。默认值：原存储类型 */
      StorageClass?: StorageClass,
    }
  }
  interface ReplicationConfiguration {
    /** 发起者身份标示：qcs::cam::uin/&lt;OwnerUin>:uin/&lt;SubUin>	 */
    Role: string,
    /** 具体配置信息，最多支持1000个，所有策略只能指向一个目标存储桶	 */
    Rules: ReplicationRule[]
  }
  /** putBucketReplication 接口参数 */
  interface PutBucketReplicationParams extends BucketParams {
    ReplicationConfiguration,
  }
  /** putBucketReplication 接口返回值 */
  interface PutBucketReplicationResult extends GeneralResult {}

  // getBucketReplication
  /** getBucketReplication 接口参数 */
  interface GetBucketReplicationParams extends BucketParams {}
  /** getBucketReplication 接口返回值 */
  interface GetBucketReplicationResult extends GeneralResult {
    ReplicationConfiguration
  }

  // deleteBucketReplication
  /** deleteBucketReplication 接口参数 */
  interface DeleteBucketReplicationParams extends BucketParams {}
  /** deleteBucketReplication 接口返回值 */
  interface DeleteBucketReplicationResult extends GeneralResult {}

  // putBucketWebsite
  /** 存储桶配置静态网站配置信息 */
  interface WebsiteConfiguration {
    /** 索引文档配置 */
    IndexDocument: {
      /** 指定索引文档的对象键后缀。例如指定为index.html，那么当访问到存储桶的根目录时，会自动返回 index.html 的内容，或者当访问到article/目录时，会自动返回 article/index.html的内容 */
      Suffix: string,
    },
    /** 重定向所有请求配置	 */
    RedirectAllRequestsTo?: {
      /** 指定重定向所有请求的目标协议，只能设置为 https */
      Protocol: "https" | string
    },
    /** 用于配置是否忽略扩展名	 */
    AutoAddressing?: {
      /** 用于配置是否忽略 HTML 拓展名，可选值为 Enabled 或 Disabled，默认为 Disabled */
      Status: 'Disabled' | 'Enabled'
    },
    /** 错误文档配置	 */
    ErrorDocument?: {
      /** 指定通用错误文档的对象键，当发生错误且未命中重定向规则中的错误码重定向时，将返回该对象键的内容 */
      Key: Key,
      /** 用于配置命中错误文档的 HTTP 状态码，可选值为 Enabled 或 Disabled，默认为 Enabled */
      OriginalHttpStatus?: 'Enabled' | 'Disabled，默认为'
    },
    /** 重定向规则配置，最多设置100条 RoutingRule */
    RoutingRules?: {
      /** 重定向规则的条件配置 */
      Condition: {
        /** 指定重定向规则的错误码匹配条件，只支持配置4XX返回码，例如403或404，HttpErrorCodeReturnedEquals 与 KeyPrefixEquals 必选其 */
        HttpErrorCodeReturnedEquals?: string | number,
        /** 指定重定向规则的对象键前缀匹配条件，HttpErrorCodeReturnedEquals 与 KeyPrefixEquals 必选其一 */
        KeyPrefixEquals?: 'Enabled' | 'Disabled',
      },
      /** 重定向规则的具体重定向目标配置 */
      Redirect: {
        /** 指定重定向规则的目标协议，只能设置为 https */
        Protocol?: 'https' | string,
        /** 指定重定向规则的具体重定向目标的对象键，替换方式为替换整个原始请求的对象键，ReplaceKeyWith 与 ReplaceKeyPrefixWith 必选其一 */
        ReplaceKeyWith?: string,
        /** 指定重定向规则的具体重定向目标的对象键，替换方式为替换原始请求中所匹配到的前缀部分，仅可在 Condition 为 KeyPrefixEquals 时设置，ReplaceKeyWith 与 ReplaceKeyPrefixWith 必选其一 */
        ReplaceKeyPrefixWith?: string,
      },
    }[],
  }
  /** putBucketWebsite 接口参数 */
  interface PutBucketWebsiteParams extends BucketParams {
    /** 存储桶配置静态网站配置信息 */
    WebsiteConfiguration: WebsiteConfiguration,
  }
  /** putBucketWebsite 接口返回值 */
  interface PutBucketWebsiteResult extends GeneralResult {}

  // getBucketWebsite
  /** getBucketWebsite 接口参数 */
  interface GetBucketWebsiteParams extends BucketParams {}
  /** getBucketWebsite 接口返回值 */
  interface GetBucketWebsiteResult extends GeneralResult {
    /** 存储桶配置静态网站配置信息 */
    WebsiteConfiguration: WebsiteConfiguration
  }

  // deleteBucketWebsite
  /** deleteBucketWebsite 接口参数 */
  interface DeleteBucketWebsiteParams extends BucketParams {}
  /** deleteBucketWebsite 接口返回值 */
  interface DeleteBucketWebsiteResult extends GeneralResult {}

  // putBucketReferer
  /** 防盗链配置信息 */
  interface RefererConfiguration {
    /** 是否开启防盗链，枚举值：Enabled、Disabled */
    Status: 'Enabled' | 'Disabled',
    /** 防盗链类型，枚举值：Black-List、White-List */
    RefererType: 'Black-List' | 'White-List',
    /** 生效域名列表， 支持多个域名且为前缀匹配， 支持带端口的域名和 IP， 支持通配符*，做二级域名或多级域名的通配 */
    DomainList: {
      /** 生效域名，例如www.qq.com/example，192.168.1.2:8080， *.qq.com */
      Domains: string[]
    },
    /** 是否允许空 Referer 访问，枚举值：Allow、Deny，默认值为 Deny */
    EmptyReferConfiguration?: 'Allow' | 'Deny',
  }
  /** putBucketReferer 接口参数 */
  interface PutBucketRefererParams extends BucketParams {
    /** 防盗链配置信息 */
    RefererConfiguration: RefererConfiguration,
  }
  /** putBucketReferer 接口返回值 */
  interface PutBucketRefererResult extends GeneralResult {}

  // getBucketReferer
  /** getBucketReferer 接口参数 */
  interface GetBucketRefererParams extends BucketParams {}
  /** getBucketReferer 接口返回值 */
  interface GetBucketRefererResult extends GeneralResult {
    /** 防盗链配置信息 */
    RefererConfiguration: RefererConfiguration,
  }

  // putBucketDomain
  /** putBucketDomain 接口参数 */
  interface PutBucketDomainParams extends BucketParams {
    DomainRule: {
      Status: 'DISABLED' | 'ENABLED',
      Name: string,
      Type: 'REST' | 'WEBSITE'
    },
  }
  /** putBucketDomain 接口返回值 */
  interface PutBucketDomainResult extends GeneralResult {}

  // getBucketDomain
  interface DomainRule {
    Status: 'DISABLED' | 'ENABLED',
    Name: string,
    Type: 'REST' | 'WEBSITE'
  }
  /** getBucketDomain 接口参数 */
  interface GetBucketDomainParams extends BucketParams {}
  /** getBucketDomain 接口返回值 */
  interface GetBucketDomainResult extends GeneralResult {
    DomainRule: DomainRule[]
  }

  // deleteBucketDomain
  /** deleteBucketDomain 接口参数 */
  interface DeleteBucketDomainParams extends BucketParams {}
  /** deleteBucketDomain 接口返回值 */
  interface DeleteBucketDomainResult extends GeneralResult {}

  // putBucketOrigin
  /** putBucketOrigin 接口参数 */
  interface PutBucketOriginParams extends BucketParams {
    OriginRule: DomainRule[],
  }
  /** putBucketOrigin 接口返回值 */
  interface PutBucketOriginResult extends GeneralResult {}

  // getBucketOrigin
  /** getBucketOrigin 接口参数 */
  interface GetBucketOriginParams extends BucketParams {}
  /** getBucketOrigin 接口返回值 */
  interface GetBucketOriginResult extends GeneralResult {
    OriginRule: object[],
  }

  // deleteBucketOrigin
  /** deleteBucketOrigin 接口参数 */
  interface DeleteBucketOriginParams extends BucketParams {}
  /** deleteBucketOrigin 接口返回值 */
  interface DeleteBucketOriginResult extends GeneralResult {}

  // putBucketLogging
  interface BucketLoggingStatus {
    /** 存储桶 logging 设置的具体信息，主要是目标存储桶 */
    LoggingEnabled?: {
      /** 存放日志的目标存储桶，可以是同一个存储桶（但不推荐），或同一账户下、同一地域的存储桶 */
      TargetBucket: Bucket,
      /** 日志存放在目标存储桶的指定路径 */
      TargetPrefix: Prefix,
    }
  }
  /** putBucketLogging 接口参数 */
  interface PutBucketLoggingParams extends BucketParams {
    /** 说明日志记录配置的状态，如果无子节点信息则意为关闭日志记录 */
    BucketLoggingStatus,
  }
  /** putBucketLogging 接口返回值 */
  interface PutBucketLoggingResult extends GeneralResult {}

  // getBucketLogging
  /** getBucketLogging 接口参数 */
  interface GetBucketLoggingParams extends BucketParams {}
  /** getBucketLogging 接口返回值 */
  interface GetBucketLoggingResult extends GeneralResult {
    /** 说明日志记录配置的状态，如果无子节点信息则意为关闭日志记录 */
    BucketLoggingStatus,
  }

  // putBucketInventory
  /** putBucketInventory 接口参数 */
  interface PutBucketInventoryParams extends BucketParams {
    Id: string,
    InventoryConfiguration: object,
  }
  /** putBucketInventory 接口返回值 */
  interface PutBucketInventoryResult extends GeneralResult {}

  // getBucketInventory
  /** getBucketInventory 接口参数 */
  interface GetBucketInventoryParams extends BucketParams {
    Id: string,
  }
  /** getBucketInventory 接口返回值 */
  interface GetBucketInventoryResult extends GeneralResult {
    InventoryConfiguration: object
  }

  // listBucketInventory
  /** listBucketInventory 接口参数 */
  interface ListBucketInventoryParams extends BucketParams {}
  /** listBucketInventory 接口返回值 */
  interface ListBucketInventoryResult extends GeneralResult {
    ContinuationToken: string,
    InventoryConfigurations: object,
    /** 仅当响应条目有截断（IsTruncated 为 true）才会返回该节点，该节点的值为当前响应条目中的最后一个对象键，当需要继续请求后续条目时，将该节点的值作为下一次请求的 marker 参数传入 */
    IsTruncated: BooleanString,
  }

  // deleteBucketInventory
  /** deleteBucketInventory 接口参数 */
  interface DeleteBucketInventoryParams extends BucketParams {
    Id: string,
  }
  /** deleteBucketInventory 接口返回值 */
  interface DeleteBucketInventoryResult extends GeneralResult {}

  // putBucketAccelerate
  /** putBucketAccelerate 接口参数 */
  interface PutBucketAccelerateParams extends BucketParams {
    AccelerateConfiguration: {
      Status: 'Enabled' | 'Suspended'
    },
  }
  /** putBucketAccelerate 接口返回值 */
  interface PutBucketAccelerateResult extends GeneralResult {}

  // getBucketAccelerate
  /** getBucketAccelerate 接口参数 */
  interface GetBucketAccelerateParams extends BucketParams {
    Id: string,
  }
  /** getBucketAccelerate 接口返回值 */
  interface GetBucketAccelerateResult extends GeneralResult {
    InventoryConfiguration: {
      Status: 'Enabled' | 'Suspended',
      Type: 'COS' | string,
    }
  }

  // headObject
  /** headObject 接口参数 */
  interface HeadObjectParams extends ObjectParams {}
  /** headObject 接口返回值 */
  interface HeadObjectResult extends GeneralResult {
    /** 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，例如"8e0b617ca298a564c3331da28dcb50df"。此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同 */
    ETag: ETag,
    /** 对象的版本 ID */
    VersionId?: string,
  }

  // getObject
  // getObjectStream
  /** getObject 接口参数 */
  interface GetObjectParams extends ObjectParams {
    BodyType?: 'text' | 'blob' | 'arraybuffer',
    /** 写入流，可以传本地文件写入流 */
    Output?: Stream,
    /** 请求里的 Url Query 参数 */
    Query?: Query,
    /** 当对象在指定时间后被修改，则返回对象，否则返回 HTTP 状态码为304（Not Modified） */
    IfModifiedSince?: string,
    /** 当对象在指定时间后未被修改，则返回对象，否则返回 HTTP 状态码为412（Precondition Failed） */
    IfUnmodifiedSince?: string,
    /** 当对象的 ETag 与指定的值一致，则返回对象，否则返回 HTTP 状态码为412（Precondition Failed） */
    IfMatch?: string,
    /** 当对象的 ETag 与指定的值不一致，则返回对象，否则返回 HTTP 状态码为304（Not Modified） */
    IfNoneMatch?: string,
    /** 针对本次下载进行流量控制的限速值，必须为数字，单位默认为 bit/s。限速值设置范围为819200 - 838860800，即100KB/s - 100MB/s，如果超出该范围将返回400错误 */
    TrafficLimit?: number,
    /** 设置响应中的 Cache-Control 头部的值 */
    ResponseCacheControl?: string,
    /** 设置响应中的 Content-Disposition 头部的值 */
    ResponseContentDisposition?: string,
    /** 设置响应中的 Content-Encoding 头部的值 */
    ResponseContentEncoding?: string,
    /** 设置响应中的 Content-Language 头部的值 */
    ResponseContentLanguage?: string,
    /** 设置响应中的 Content-Type 头部的值 */
    ResponseExpires?: string,
    /** 设置响应中的 Expires 头部的值 */
    ResponseContentType?: string,
    /** 当启用版本控制时，指定要下载的版本 ID，如不指定则下载对象的最新版本 */
    VersionId?: string,
    /** 下载的进度回调方法 */
    onProgress?: onProgress,
  }
  /** getObject 接口返回值 */
  interface GetObjectResult extends GeneralResult {
    /** 对象内容 */
    Body: GetObjectBody,
    /** 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，例如"8e0b617ca298a564c3331da28dcb50df"。此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同 */
    ETag: ETag,
    /** 对象的版本 ID */
    VersionId?: string,
  }

  // putObject
  /** putObject 接口参数 */
  interface PutObjectParams extends ObjectParams {
    /** 要上传对象内容 */
    Body: UploadBody,
    /** 上传的文件大小，单位 Byte 字节，如果不传且 Body 是流，会走服务端流式上传 */
    ContentLength?: number,
    /** 请求里的 Url Query 参数 */
    Query?: string,
    /** RFC 2616 中定义的缓存指令，将作为对象元数据保存 */
    CacheControl?: string,
    /** RFC 2616 中定义的文件名称，将作为对象元数据保存 */
    ContentDisposition?: string,
    /** RFC 2616 中定义的编码格式，将作为对象元数据保存 */
    ContentEncoding?: string,
    /** RFC 2616 中定义的 HTTP 请求内容类型（MIME），此头部用于描述待上传对象的内容类型，将作为对象元数据保存。例如text/html或image/jpeg */
    ContentType?: string,
    /** RFC 2616 中定义的缓存失效时间，将作为对象元数据保存 */
    Expires?: string,
    /** RFC 2616 中定义的缓存失效时间，将作为对象元数据保存 */
    Expect?: string,
    /** 允许用户自定义存储桶权限，有效值：private | public-read | public-read-write，可选 */
    ACL?: ObjectACL,
    /** 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantRead?: Grant,
    /** 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantReadAcp?: Grant,
    /** 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantWriteAcp?: Grant,
    /** 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantFullControl?: Grant,
    /** 对象存储类型。例如 STANDARD | STANDARD_IA | ARCHIVE | DEEP_ARCHIVE | INTELLIGENT_TIERING | MAZ_STANDARD | MAZ_STANDARD_IA | MAZ_INTELLIGENT_TIERING。默认值：STANDARD */
    StorageClass?: StorageClass,
    /** 包括用户自定义元数据头部后缀和用户自定义元数据信息，将作为对象元数据保存，大小限制为2KB，注意：用户自定义元数据信息支持下划线（_），但用户自定义元数据头部后缀不支持下划线，仅支持减号（-） */
    'x-cos-meta-*'?: string,
    /** 任务开始上传的回调方法 */
    onTaskReady?: () => void,
    /** 上传的进度回调方法 */
    onProgress?: onProgress,
  }
  /** putObject 接口返回值 */
  interface PutObjectResult extends GeneralResult {
    /** 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，例如"8e0b617ca298a564c3331da28dcb50df"。此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同 */
    ETag: ETag,
    /** 创建的存储桶访问地址，不带 https:// 前缀，例如 examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com/images/1.jpg */
    Location: string,
    /** 对象的版本 ID */
    VersionId?: VersionId,
  }

  // deleteObject
  /** deleteObject 接口参数 */
  interface DeleteObjectParams extends ObjectParams {}
  /** deleteObject 接口返回值 */
  interface DeleteObjectResult extends GeneralResult {}

  // deleteMultipleObject
  /** deleteMultipleObject 接口参数 */
  interface DeleteMultipleObjectParams extends ObjectParams {
    /** 要删除的对象列表 */
    Objects: {
      /** 要删除的对象键 */
      Key: Key,
      /** 要删除的对象版本 ID */
      VersionId?: string
    }[]
  }
  /** deleteMultipleObject 接口返回值 */
  interface DeleteMultipleObjectResult extends GeneralResult {
    Deleted: {
      /** 删除成功的对象的对象键 */
      Key: Key,
      /** 删除成功的版本 ID，仅当请求中指定了要删除对象的版本 ID 时才返回该元素 */
      VersionId?: VersionId,
      /** 仅当对该对象的删除创建了一个删除标记，或删除的是该对象的一个删除标记时才返回该元素，布尔值，固定为 true */
      DeleteMarker?: BooleanString,
      /** 仅当对该对象的删除创建了一个删除标记，或删除的是该对象的一个删除标记时才返回该元素，值为创建或删除的删除标记的版本 ID */
      DeleteMarkerVersionId?: VersionId,
    }[],
    Error: {
      /** 删除失败的对象的对象键 */
      Key: Key,
      /** 删除失败的版本 ID，仅当请求中指定了要删除对象的版本 ID 时才返回该元素 */
      VersionId?: string,
      /** 删除失败的错误码，用来定位唯一的错误条件和确定错误场景 */
      Code?: string,
      /** 删除失败的具体错误信息 */
      Message?: string,
    }[],
  }

  // getObjectAcl
  /** getObjectAcl 接口参数 */
  interface GetObjectAclParams extends ObjectParams {}
  /** getObjectAcl 接口返回值 */
  interface GetObjectAclResult extends GeneralResult {
    /** 允许用户自定义存储桶权限，有效值：private | public-read | public-read-write */
    ACL: ObjectACL,
    /** 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者 */
    GrantRead: Grant,
    /** 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者 */
    GrantReadAcp: Grant,
    /** 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者 */
    GrantWriteAcp: Grant,
    /** 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者 */
    GrantFullControl: Grant,
    /** 存储桶持有者信息 */
    Owner: Owner,
    /** 被授权者信息与权限信息 */
    Grants: Grants,
  }

  // putObjectAcl
  /** putObjectAcl 接口参数 */
  interface PutObjectAclParams extends ObjectParams {
    /** 允许用户自定义存储桶权限，有效值：private | public-read | public-read-write，可选 */
    ACL?: ObjectACL,
    /** 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantRead?: Grant,
    /** 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantReadAcp?: Grant,
    /** 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantWriteAcp?: Grant,
    /** 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantFullControl?: Grant,
  }
  /** putObjectAcl 接口返回值 */
  interface PutObjectAclResult extends GeneralResult {}

  // optionsObject
  /** optionsObject 接口参数 */
  interface OptionsObjectParams extends ObjectParams {
    /** 发起 CORS 请求所用的方法（Method） */
    AccessControlRequestMethod: Method,
    /** 发起 CORS 请求时使用的 HTTP 请求头部，不区分英文大小写，可使用英文逗号(,)分隔多个头部 */
    AccessControlRequestHeaders: string,
  }
  /** optionsObject 接口返回值 */
  interface OptionsObjectResult extends GeneralResult {
    /** 允许发起 CORS 的域名，可能的值有以下两种：
*：代表允许所有域名
请求头 Origin 中指定的域名：代表允许指定域名 */
    AccessControlAllowOrigin: string,
    /** 允许发起 CORS 请求所使用的方法（Method），可使用英文逗号(,)分隔多个方法 */
    AccessControlAllowMethods: string,
    /** 允许发起 CORS 请求带的 HTTP 头部，不区分英文大小写，可使用英文逗号(,)分隔多个头部 */
    AccessControlAllowHeaders: string,
    /** 允许浏览器获取的 CORS 请求中的 HTTP 响应头部，不区分英文大小写，可使用英文逗号(,)分隔多个头部 */
    AccessControlExposeHeaders: string,
    /** CORS 配置的有效时间，单位为秒，在有效时间内，浏览器无须为同一请求再次发起预检请求 */
    AccessControlMaxAge: string
  }

  // restoreObject
  interface RestoreRequest {
    /** 指定恢复出的临时副本的有效时长，单位为“天” */
    Days: number | string,
    /** 恢复工作参数 */
    CASJobParameters: {
    /** 恢复时，Tier 可以指定为支持的恢复模式。
对于恢复归档存储类型数据，有三种恢复模式，分别为：
Expedited：极速模式，恢复任务在1 - 5分钟内可完成。
Standard：标准模式，恢复任务在3 - 5小时内完成
Bulk：批量模式，恢复任务在5 - 12小时内完成。
对于恢复深度归档存储类型数据，有两种恢复模式，分别为：
Standard：标准模式，恢复时间为12 - 24小时。
Bulk：批量模式，恢复时间为24 - 48小时。 */
      Tier: 'Expedited' | 'Standard' | 'Bulk'
    }
  }
  /** restoreObject 接口参数 */
  interface RestoreObjectParams extends ObjectParams {
    /** 包含 POST Object restore 操作的所有请求信息 */
    RestoreRequest: RestoreRequest,
    /** 当启用版本控制时，指定要恢复的版本 ID，如不指定则恢复对象的最新版本 */
    VersionId?: VersionId,
  }
  /** restoreObject 接口返回值 */
  interface RestoreObjectResult extends GeneralResult {}

  // selectObjectContent
  // selectObjectContentStream
  /** selectObjectContent 接口参数 */
  interface SelectObjectContentParams extends ObjectParams {
    /** 接口的版本信息，当前最新版本是 2 */
    SelectType: number,
    /** 检索参数，当前版本支持检索 JSON、CSV 文件内容 */
    SelectRequest: object,
    /** 当启用版本控制时，指定要检索的版本 ID，如不指定则检索对象的最新版本 */
    VersionId?: VersionId,
  }
  /** selectObjectContent 接口返回值 */
  interface SelectObjectContentResult extends GeneralResult {
    /** 查询过程统计信息 */
    Stats: {
      /** 如果文件是压缩文件，该数值代表文件解压前的字节大小；如果文件不是压缩文件，该数值即文件的字节大小 */
      BytesScanned: number,
      /** 如果文件是压缩文件，该数值代表文件解压后的字节大小；如果文件不是压缩文件，该数值即文件的字节大小 */
      BytesProcessed: number,
      /** COS Select 在本次查询中返回的检索结果字节大小 */
      BytesReturned: number,
    },
    /** 查询的结果内容 */
    Payload?: Buffer,
  }

  // putObjectCopy
  /** putObjectCopy 接口参数 */
  interface PutObjectCopyParams extends ObjectParams {
    /** 源对象的 URL，其中对象键需经过 URLEncode，可以通过 versionId 参数指定源对象的版本，例如： sourcebucket-1250000001.cos.ap-shanghai.myqcloud.com/example-%E8%85%BE%E8%AE%AF%E4%BA%91.jpg 或 sourcebucket-1250000001.cos.ap-shanghai.myqcloud.com/example-%E8%85%BE%E8%AE%AF%E4%BA%91.jpg?versionId=MTg0NDUxNzYzMDc0NDMzNDExOTc */
    CopySource: string,
    /** 是否复制源对象的元数据信息，枚举值：Copy，Replaced，默认为 Copy。如果标记为 Copy，则复制源对象的元数据信息；如果标记为 Replaced，则按本次请求的请求头中的元数据信息作为目标对象的元数据信息；当目标对象和源对象为同一对象时，即用户试图修改元数据时，则标记必须为 Replaced */
    MetadataDirective?: 'Copy' | 'Replaced',
    /** 允许用户自定义存储桶权限，有效值：private | public-read | public-read-write，可选 */
    ACL?: ObjectACL,
    /** 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantRead?: Grant,
    /** 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantReadAcp?: Grant,
    /** 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantWriteAcp?: Grant,
    /** 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantFullControl?: Grant,
    /** 当对象在指定时间后被修改，则执行复制操作，否则返回 HTTP 状态码为412（Precondition Failed） */
    CopySourceIfModifiedSince?: string,
    /** 当对象在指定时间后未被修改，则执行复制操作，否则返回 HTTP 状态码为412（Precondition Failed） */
    CopySourceIfUnmodifiedSince?: string,
    /** 当对象的 ETag 与指定的值一致，则执行复制操作，否则返回 HTTP 状态码为412（Precondition Failed） */
    CopySourceIfMatch?: string,
    /** 当对象的 ETag 与指定的值不一致，则执行复制操作，否则返回 HTTP 状态码为412（Precondition Failed） */
    CopySourceIfNoneMatch?: string,
    /** 对象存储类型。例如 STANDARD | STANDARD_IA | ARCHIVE | DEEP_ARCHIVE | INTELLIGENT_TIERING | MAZ_STANDARD | MAZ_STANDARD_IA | MAZ_INTELLIGENT_TIERING。默认值：STANDARD */
    StorageClass?: StorageClass,
    /** RFC 2616 中定义的缓存指令，将作为目标对象元数据保存 */
    CacheControl?: string,
    /** RFC 2616 中定义的文件名称，将作为目标对象元数据保存 */
    ContentDisposition?: string,
    /** RFC 2616 中定义的编码格式，将作为目标对象元数据保存 */
    ContentEncoding?: string,
    /** RFC 2616 中定义的 HTTP 请求内容类型（MIME），此头部用于描述目标对象的内容类型，将作为目标对象元数据保存。例如 text/html 或 image/jpeg。 */
    ContentType?: string,
    /** RFC 2616 中定义的缓存失效时间，将作为目标对象元数据保存 */
    Expires?: string,
    /** 包括用户自定义元数据头部后缀和用户自定义元数据信息，将作为目标对象元数据保存，大小限制为2KB。注意：用户自定义元数据信息支持下划线（_），但用户自定义元数据头部后缀不支持下划线，仅支持减号（-） */
    'x-cos-meta-*'?: string
  }
  /** putObjectCopy 接口返回值 */
  interface PutObjectCopyResult extends GeneralResult {}

  // putObjectTagging
  /** putObjectTagging 接口参数 */
  interface PutObjectTaggingParams extends ObjectParams {
    /** 标签集合，最多支持10个标签 */
    Tags: Tag[],
    /** 对象的版本 ID；当未启用版本控制时，该节点的值为空字符串；当启用版本控制时，启用版本控制之前的对象，其版本 ID 为 null；当暂停版本控制时，新上传的对象其版本 ID 为 null，且同一个对象最多只存在一个版本 ID 为 null 的对象版本 */
    VersionId?: VersionId,
  }
  /** putObjectTagging 接口返回值 */
  interface PutObjectTaggingResult extends GeneralResult {}

  // getObjectTagging
  /** getObjectTagging 接口参数 */
  interface GetObjectTaggingParams extends ObjectParams {}
  /** getObjectTagging 接口返回值 */
  interface GetObjectTaggingResult extends GeneralResult {
    /** 标签集合，最多支持10个标签 */
    Tags: Tag[],
  }

  // deleteObjectTagging
  /** deleteObjectTagging 接口参数 */
  interface DeleteObjectTaggingParams extends ObjectParams {}
  /** deleteObjectTagging 接口返回值 */
  interface DeleteObjectTaggingResult extends GeneralResult {}

  // multipartInit
  /** multipartInit 接口参数 */
  interface MultipartInitParams extends ObjectParams {
    /** RFC 2616 中定义的缓存指令，将作为对象元数据保存 */
    CacheControl?: string,
    /** RFC 2616 中定义的文件名称，将作为对象元数据保存 */
    ContentDisposition?: string,
    /** RFC 2616 中定义的编码格式，将作为对象元数据保存 */
    ContentEncoding?: string,
    /** RFC 2616 中定义的 HTTP 请求内容类型（MIME），此头部用于描述待上传对象的内容类型，将作为对象元数据保存。例如text/html或 image/jpeg */
    ContentType?: string,
    /** RFC 2616 中定义的缓存失效时间，将作为对象元数据保存 */
    Expires?: string,
    /** 允许用户自定义存储桶权限，有效值：private | public-read | public-read-write，可选 */
    ACL?: ObjectACL,
    /** 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantRead?: Grant,
    /** 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantReadAcp?: Grant,
    /** 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantWriteAcp?: Grant,
    /** 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantFullControl?: Grant,
    /** 请求里的 Url Query 参数 */
    Query?: Query,
    /** 对象存储类型。例如 STANDARD | STANDARD_IA | ARCHIVE | DEEP_ARCHIVE | INTELLIGENT_TIERING | MAZ_STANDARD | MAZ_STANDARD_IA | MAZ_INTELLIGENT_TIERING。默认值：STANDARD */
    StorageClass?: StorageClass,
    /** 包括用户自定义元数据头部后缀和用户自定义元数据信息，将作为对象元数据保存，大小限制为2KB。注意：用户自定义元数据信息支持下划线（_），但用户自定义元数据头部后缀不支持下划线，仅支持减号（-） */
    'x-cos-meta-*'?: string,
  }
  /** multipartInit 接口返回值 */
  interface MultipartInitResult extends GeneralResult {
    UploadId: string,
  }

  // multipartUpload
  /** multipartUpload 接口参数 */
  interface MultipartUploadParams extends ObjectParams {
    /** 要上传分片内容 */
    Body: UploadBody,
    /** 要上传分片内容大小 */
    ContentLength?: number,
    /** 服务端加密算法 */
    ServerSideEncryption?: string,
  }
  /** multipartUpload 接口返回值 */
  interface MultipartUploadResult extends GeneralResult {
    /** 返回对象的 MD5 算法校验值，ETag 的值可以用于检查分块的内容是否发生变化 */
    ETag: ETag
  }

  // uploadPartCopy
  /** uploadPartCopy 接口参数 */
  interface UploadPartCopyParams extends ObjectParams {
    /** 源对象 URL 路径，可以通过 versionid 子资源指定历史版本 */
    CopySource: string,
    /** 分块上传的任务 ID */
    UploadId: UploadId,
    /** 标识本次分块上传的编号，范围在1 - 10000 */
    PartNumber: PartNumber,
    /** 源对象的字节范围，范围值必须使用 bytes=first-last 格式，first 和 last 都是基于 0 开始的偏移量。例如 bytes=0-9 表示您希望拷贝源对象的开头10个字节的数据，如果不指定，则表示拷贝整个对象 */
    CopySourceRange?: string,
    /** 当 Object 在指定时间后被修改，则执行操作，否则返回412，可与 x-cos-copy-source-If-None-Match 一起使用，与其他条件联合使用返回冲突 */
    CopySourceIfModifiedSince?: string,
    /** 当 Object 在指定时间后未被修改，则执行操作，否则返回412，可与 x-cos-copy-source-If-Match 一起使用，与其他条件联合使用返回冲突 */
    CopySourceIfUnmodifiedSince?: string,
    /** 当 Object 的 Etag 和给定一致时，则执行操作，否则返回412，可与 x-cos-copy-source-If-Unmodified-Since 一起使用，与其他条件联合使用返回冲突 */
    CopySourceIfMatch?: string,
    /** 当 Object 的 Etag 和给定不一致时，则执行操作，否则返回412，可与 x-cos-copy-source-If-Modified-Since 一起使用，与其他条件联合使用返回冲突 */
    CopySourceIfNoneMatch?: string,
  }
  /** uploadPartCopy 接口返回值 */
  interface UploadPartCopyResult extends GeneralResult {
    /** 返回对象的 MD5 算法校验值，ETag 的值可以用于检查分块的内容是否发生变化 */
    ETag: ETag
  }

  // multipartComplete
  /** multipartComplete 接口参数 */
  interface MultipartCompleteParams extends ObjectParams {
    /** 分块上传的任务 ID */
    UploadId: UploadId,
    /** 用来说明本次分块上传中每个块的信息 */
    Parts: Part[],
  }
  /** multipartComplete 接口返回值 */
  interface MultipartCompleteResult extends GeneralResult {
    /** 使用 Upload Part 请求上传分块成功后返回的 ETag 响应头部的值 */
    ETag: ETag,
    /** 创建的存储桶访问地址，不带 https:// 前缀，例如 examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com/images/1.jpg */
    Location: Location,
    /** 对象的版本 ID；当未启用版本控制时，该节点的值为空字符串；当启用版本控制时，启用版本控制之前的对象，其版本 ID 为 null；当暂停版本控制时，新上传的对象其版本 ID 为 null，且同一个对象最多只存在一个版本 ID 为 null 的对象版本 */
    VersionId?: VersionId,
  }

  // multipartList
  /** multipartList 接口参数 */
  interface MultipartListParams extends BucketParams {
    /** 限定返回的 Object key 必须以 Prefix 作为前缀。注意使用 prefix 查询时，返回的 key 中仍会包含 Prefix。 */
    Prefix: Prefix,
    /** 设置最大返回的 multipart 数量，合法取值从1到1000，默认1000 */
    MaxUploads?: number,
    /** 与 upload-id-marker 一起使用：当 upload-id-marker 未被指定时，ObjectName 字母顺序大于 key-marker 的条目将被列出。当 upload-id-marker 被指定时，ObjectName 字母顺序大于 key-marker 的条目被列出，ObjectName 字母顺序等于 key-marker 同时 UploadId 大于 upload-id-marker 的条目将被列出。 */
    KeyMarker?: Key,
    /** 与 key-marker 一起使用：当 key-marker 未被指定时，upload-id-marker 将被忽略。当 key-marker 被指定时，ObjectName字母顺序大于 key-marker 的条目被列出，ObjectName 字母顺序等于 key-marker 同时 UploadId 大于 upload-id-marker 的条目将被列出。 */
    UploadIdMarker?: UploadId,
    /** 规定返回值的编码方式，可选值：url，代表返回的对象键为 URL 编码（百分号编码）后的值，例如“腾讯云”将被编码为%E8%85%BE%E8%AE%AF%E4%BA%91 */
    EncodingType?: EncodingType,
  }
  /** multipartList 接口返回值 */
  interface MultipartListResult extends GeneralResult {
    /** 每个上传任务的信息 */
    Upload: {
      /** 对象键 */
      Key: Key,
      /** 分块上传的任务 ID */
      UploadId: UploadId,
      /** 上传任务发起者的信息 */
      Initiator: Initiator,
      /** 上传任务所有者的信息 */
      Owner: Owner,
      /** 对象存储类型。枚举值 STANDARD | STANDARD_IA | ARCHIVE | DEEP_ARCHIVE | INTELLIGENT_TIERING | MAZ_STANDARD | MAZ_STANDARD_IA | MAZ_INTELLIGENT_TIERING @see https://cloud.tencent.com/document/product/436/33417 */
      StorageClass: StorageClass,
      /** UploadId 的创建时间，为 ISO8601 格式，例如2019-05-24T10:56:40Z */
      Initiated: IsoDateTime
    }[],
    /** 仅当响应条目有截断（IsTruncated 为 true）才会返回该节点，该节点的值为当前响应条目中的最后一个对象键，当需要继续请求后续条目时，将该节点的值作为下一次请求的 marker 参数传入 */
    IsTruncated: BooleanString,
    /** 假如返回条目被截断，则返回的 NextKeyMarker 就是下一个条目的起点。 */
    NextKeyMarker: Key,
    /** 假如返回条目被截断，则返回的 UploadId 就是下一个条目的起点。 */
    NextUploadIdMarker: UploadId,
  }

  // multipartListPart
  /** multipartListPart 接口参数 */
  interface MultipartListPartParams extends ObjectParams {
    /** 请求的对象键，最前面不带 /，例如 images/1.jpg */
    Key: Key,
    /** 标识本次分块上传的 ID，使用 Initiate Multipart Upload 接口初始化分块上传时得到的 UploadId */
    UploadId: UploadId,
    /** 单次返回最大的条目数量，默认1000 */
    MaxParts?: string,
    /** 默认以 UTF-8 二进制顺序列出条目，所有列出条目从 marker 开始 */
    PartNumberMarker?: string,
    /** 规定返回值的编码方式，可选值：url，代表返回的对象键为 URL 编码（百分号编码）后的值，例如“腾讯云”将被编码为%E8%85%BE%E8%AE%AF%E4%BA%91 */
    EncodingType?: EncodingType,
  }
  /** multipartListPart 接口返回值 */
  interface MultipartListPartResult extends GeneralResult {
    /** 用来说明本次分块上传中每个块的信息 */
    Part: {
      /** 块的编号 */
      PartNumber: PartNumber,
      /** 说明块最后被修改时间 */
      LastModified: IsoDateTime,
      /** 块的 MD5 算法校验值 */
      ETag: ETag,
      /** 说明块大小，单位是 Byte */
      Size: number,
    }[],
    /** 上传任务所有者的信息 */
    Owner: Owner,
    /** 上传任务发起者的信息 */
    Initiator: Initiator
    /** 假如返回条目被截断，则返回 NextMarker 就是下一个条目的起点 */
    NextPartNumberMarker: number,
    /** 对象存储类型。枚举值 STANDARD | STANDARD_IA | ARCHIVE | DEEP_ARCHIVE | INTELLIGENT_TIERING | MAZ_STANDARD | MAZ_STANDARD_IA | MAZ_INTELLIGENT_TIERING @see https://cloud.tencent.com/document/product/436/33417 */
    StorageClass: StorageClass,
    /** 仅当响应条目有截断（IsTruncated 为 true）才会返回该节点，该节点的值为当前响应条目中的最后一个对象键，当需要继续请求后续条目时，将该节点的值作为下一次请求的 marker 参数传入 */
    IsTruncated: BooleanString,
  }

  // multipartAbort
  /** multipartAbort 接口参数 */
  interface MultipartAbortParams extends ObjectParams {
    UploadId: string,
  }
  /** multipartAbort 接口返回值 */
  interface MultipartAbortResult extends GeneralResult {}

  // sliceUploadFile
  /** sliceUploadFile 接口参数 */
  interface SliceUploadFileParams extends ObjectParams {
    /** 要上传的本地文件路径 */
    FilePath: string,
    /** 请求里的 Url Query 参数 */
    Query?: string,
    /** RFC 2616 中定义的缓存指令，将作为对象元数据保存 */
    CacheControl?: string,
    /** RFC 2616 中定义的文件名称，将作为对象元数据保存 */
    ContentDisposition?: string,
    /** RFC 2616 中定义的编码格式，将作为对象元数据保存 */
    ContentEncoding?: string,
    /** RFC 2616 中定义的 HTTP 请求内容类型（MIME），此头部用于描述待上传对象的内容类型，将作为对象元数据保存。例如text/html或image/jpeg */
    ContentType?: string,
    /** RFC 2616 中定义的缓存失效时间，将作为对象元数据保存 */
    Expires?: string,
    /** RFC 2616 中定义的缓存失效时间，将作为对象元数据保存 */
    Expect?: string,
    /** 允许用户自定义存储桶权限，有效值：private | public-read | public-read-write，可选 */
    ACL?: ObjectACL,
    /** 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantRead?: Grant,
    /** 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantReadAcp?: Grant,
    /** 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantWriteAcp?: Grant,
    /** 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选 */
    GrantFullControl?: Grant,
    /** 对象存储类型。枚举值 STANDARD | STANDARD_IA | ARCHIVE | DEEP_ARCHIVE | INTELLIGENT_TIERING | MAZ_STANDARD | MAZ_STANDARD_IA | MAZ_INTELLIGENT_TIERING @see https://cloud.tencent.com/document/product/436/33417 */
    StorageClass?: StorageClass,
    /** 包括用户自定义元数据头部后缀和用户自定义元数据信息，将作为对象元数据保存，大小限制为2KB，注意：用户自定义元数据信息支持下划线（_），但用户自定义元数据头部后缀不支持下划线，仅支持减号（-） */
    'x-cos-meta-*'?: string,
    /** 任务开始上传的回调方法 */
    onTaskReady?: () => void,
    /** 上传的进度回调方法 */
    onProgress?: onProgress,
    /** 续传校验的进度回调方法 */
    onHashProgress?: onProgress,
  }
  /** sliceUploadFile 接口返回值 */
  interface SliceUploadFileResult extends GeneralResult {
    /** 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，例如"8e0b617ca298a564c3331da28dcb50df"。此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同 */
    ETag: ETag,
    /** 创建的存储桶访问地址，不带 https:// 前缀，例如 examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com/images/1.jpg */
    Location: string,
    /** 对象的版本 ID */
    VersionId?: VersionId,
  }

  // abortUploadTask
  /** abortUploadTask 接口参数 */
  interface AbortUploadTaskParams extends ObjectParams {
    /** 清理上传任务的级别，枚举值 'task' | 'file' | 'bucket'，默认 task */
    Level?: 'task' | 'file' | 'bucket',
    /** 要清理的 UploadId，Level 为 task 时必选 */
    UploadId?: UploadId,
  }
  /** abortUploadTask 接口返回值 */
  interface AbortUploadTaskResult extends GeneralResult {}

  // uploadFiles
  type UploadFileItemParams = (PutObjectParams | SliceUploadFileParams) & {
    /** 要上传的本地文件路径 */
    FilePath: string,
    /** 上传的进度回调方法 */
    onProgress?: onProgress,
    /** 上传完成回调方法 */
    onFileFinish?: (err: Error, data?: object) => void,
  }
  /** 要上传的单个文件参数 */
  interface UploadFileItemResult extends GeneralResult {
    /** 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，例如"8e0b617ca298a564c3331da28dcb50df"。此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同 */
    ETag: ETag,
    /** 创建的存储桶访问地址，不带 https:// 前缀，例如 examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com/images/1.jpg */
    Location: string,
    /** 对象的版本 ID */
    VersionId?: VersionId,
  }
  interface UploadFilesParams {
    /** 要上传的文件参数列表 */
    files: UploadFileItemParams[],
    /** 使用 uploadFiles 批量上传时，文件大小大于该数值将使用按分块上传，否则将调用简单上传，单位 Byte，默认值1048576（1MB） */
    SliceSize?: number,
    /** 所有文件整体上传进度回调方法 */
    onProgress?: onProgress,
    /** 所有文件上传完成回调方法 */
    onFileFinish?: (err: CosError, data?: object) => void,
  }
  /** uploadFiles 接口返回值 */
  interface UploadFilesResult extends GeneralResult {
    /** 文件列表上传结果 */
    files: {
      /** 单个文件上传参数 */
      options: UploadFileItemParams,
      /** 单个文件上传错误信息 */
      error: Error,
      /** 单个文件上传成功信息 */
      data: UploadFileItemResult,
    }[],
  }

  // sliceCopyFile
  /** sliceCopyFile 接口参数 */
  interface SliceCopyFileParams extends ObjectParams {
    /** 源对象的 URL，其中对象键需经过 URLEncode，可以通过 versionId 参数指定源对象的版本，例如： sourcebucket-1250000001.cos.ap-shanghai.myqcloud.com/example-%E8%85%BE%E8%AE%AF%E4%BA%91.jpg 或 sourcebucket-1250000001.cos.ap-shanghai.myqcloud.com/example-%E8%85%BE%E8%AE%AF%E4%BA%91.jpg?versionId=MTg0NDUxNzYzMDc0NDMzNDExOTc */
    CopySource: string,
    /** 使用 sliceCopyFile 分块复制文件时，文件大小大于该数值将使用分块复制 ，否则将调用简单复制，默认值10485760（10MB） */
    CopySliceSize?: number,
    /** 使用 sliceCopyFile 分块复制文件时，每片的大小字节数，默认值10485760（10MB） */
    CopyChunkSize?: number,
  }
  /** sliceCopyFile 接口返回值 */
  interface SliceCopyFileResult extends GeneralResult {}

  // getTaskList
  type TaskId = string
  type Task = {
    /** 上传任务 ID */
    id: TaskId,
    /** 存储桶的名称，格式为<bucketname-appid>，例如examplebucket-1250000000 */
    Bucket: Bucket,
    /** 存储桶所在地域 @see https://cloud.tencent.com/document/product/436/6224 */
    Region: Region,
    /** 请求的对象键，最前面不带 /，例如 images/1.jpg */
    Key: Key,
    /** 要上传的本地文件路径 */
    FilePath: string,
    /** 上传状态 */
    state: 'waiting' | 'checking' | 'uploading' | 'error' | 'paused' | 'success' | 'canceled',
    /** 上传错误信息 */
    error: string | Error | { Code: string, Message: string },
    /** 已上传内容大小，单位 B（字节） */
    loaded: number,
    /** 上传文件大小，单位 B（字节） */
    size: number,
    /** 上传速递，单位 B/s */
    speed: number,
    /** 上传进度，范围 0-1，保留两位小数 */
    percent: number,
    /** 续传校验进度，范围 0-1，保留两位小数 */
    hashPercent: number,
  }
  /** 上传任务列表 */
  type TaskList = Task[]

  // getObjectUrl
  /** getObjectUrl 接口参数 */
  interface GetObjectUrlParams extends ObjectParams {
    /** 获取的 Url 是否计算签名 */
    Sign?: boolean,
    /** 请求方法 */
    Method?: Method,
    /** 请求里的 Url Query 参数 */
    Query?: Query,
    /** 签名几秒后失效，默认为900秒 */
    Expires?: number,
  }
  /** getObjectUrl 接口返回值 */
  interface GetObjectUrlResult {
    /** 返回对象 Url */
    Url: string
  }

  // getV4Auth
  interface GetV4AuthParams {
    /** 计算签名用的密钥 SecretId，如果不传会用实例本身的凭证，可选 */
    SecretId?: string,
    /** 计算签名用的密钥 SecretKey，如果不传会用实例本身的凭证，可选 */
    SecretKey?: string,
    /** 存储桶的名称，命名规则为 BucketName-APPID，例如 examplebucket-1250000000 */
    Bucket?: Bucket,
    /** 请求的对象键，最前面不带 /，例如 images/1.jpg */
    Key?: Key,
    /** 签名几秒后失效，默认为900秒 */
    Expires?: number,
  }

  // getAuth
  interface GetAuthParams {
    /** 计算签名用的密钥 SecretId，如果不传会用实例本身的凭证，可选 */
    SecretId?: string,
    /** 计算签名用的密钥 SecretKey，如果不传会用实例本身的凭证，可选 */
    SecretKey?: string,
    /** 请求方法 */
    Method?: Method,
    /** 请求的对象键，最前面不带 /，例如 images/1.jpg */
    Key?: Key,
    /** 签名几秒后失效，默认为900秒 */
    Expires?: number,
    /** 请求里的 Url Query 参数 */
    Query?: Query,
    /** 请求里的 Header 参数 */
    Headers?: Headers,
  }

}

/**
 * COS 类，创建该类的实例可用于调用 COS API
 * @see https://cloud.tencent.com/document/product/436/7751
 */
declare class COS {

  // 构造方法
  constructor(options: COS.COSOptions);

  // 静态属性
  static version: string;

  // 静态方法
  static getAuthorization: (options: COS.StaticGetAuthorizationOptions) => string;

  /**
   * 获取用户的 bucket 列表
   * @param params - 回调函数，必须，下面为参数列表
   * 无特殊参数
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   */
  getService(params: COS.GetServiceParams, callback: (err: COS.CosError, data: COS.GetServiceResult) => void): void;
  getService(params: COS.GetServiceParams): Promise<COS.GetServiceResult>;

  /**
   * 创建 Bucket，并初始化访问权限
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，可选
   * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantWrite - 赋予被授权者写取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   * @returns data.Location             操作地址
   */
  putBucket(params: COS.PutBucketParams, callback: (err: COS.CosError, data: COS.PutBucketResult) => void): void;
  putBucket(params: COS.PutBucketParams): Promise<COS.PutBucketResult>;

  /**
   * 查看是否存在该Bucket，是否有权限访问
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                       请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                      返回的数据
   * @returns data.BucketExist     Bucket是否存在
   * @returns data.BucketAuth      是否有 Bucket 的访问权限
   */
  headBucket(params: COS.HeadBucketParams, callback: (err: COS.CosError, data: COS.HeadBucketResult) => void): void;
  headBucket(params: COS.HeadBucketParams): Promise<COS.HeadBucketResult>;

  /**
   * 获取 Bucket 下的 object 列表
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Prefix - 前缀匹配，用来规定返回的文件前缀地址，可选
   * @param params.Delimiter - 定界符为一个符号，如果有Prefix，则将Prefix到delimiter之间的相同路径归为一类，可选
   * @param params.Marker - 默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，可选
   * @param params.MaxKeys - 单次返回最大的条目数量，默认1000，可选
   * @param params.EncodingType - 规定返回值的编码方式，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   * @returns data.Contents     返回的 object 列表信息
   * @returns data.CommonPrefixes     返回的公共前缀列表信息，类似当前目录下的子目录列表，如果传入了 Delimiter 就会返回该列表
   * @returns data.NextMarker     继续列出文件的时候要传入的 Marker
   * @returns data.NextVersionIdMarker     继续列出文件的时候要传入的 VersionIdMarker
   */
  getBucket(params: COS.GetBucketParams, callback: (err: COS.CosError, data: COS.GetBucketResult) => void): void;
  getBucket(params: COS.GetBucketParams): Promise<COS.GetBucketResult>;

  /**
   * 获取 Bucket 下的 object 版本列表
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Prefix - 前缀匹配，用来规定返回的文件前缀地址，可选
   * @param params.Delimiter - 定界符为一个符号，如果有Prefix，则将Prefix到delimiter之间的相同路径归为一类，可选
   * @param params.Marker - 默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，可选
   * @param params.MaxKeys - 单次返回最大的条目数量，默认1000，可选
   * @param params.VersionIdMarker - 起始版本 ID 标记，从该标记之后（不含）返回对象版本条目，如果上一次 List 结果的 NextVersionIdMarker 为空，则该参数也指定为空，可选
   * @param params.EncodingType - 规定返回值的编码方式，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   * @returns data.Contents     返回的 object 列表信息
   * @returns data.CommonPrefixes     返回的公共前缀列表信息，类似当前目录下的子目录列表，如果传入了 Delimiter 就会返回该列表
   * @returns data.IsTruncated     返回的 object 列表信息
   * @returns data.NextMarker     继续列出文件的时候要传入的 Marker
   * @returns data.NextVersionIdMarker     继续列出文件的时候要传入的 VersionIdMarker
   */
  listObjectVersions(params: COS.ListObjectVersionsParams, callback: (err: COS.CosError, data: COS.ListObjectVersionsResult) => void): void;
  listObjectVersions(params: COS.ListObjectVersionsParams): Promise<COS.ListObjectVersionsResult>;

  /**
   * 删除 Bucket
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                  返回的数据
   * @returns data.Location     操作地址
   */
  deleteBucket(params: COS.DeleteBucketParams, callback: (err: COS.CosError, data: COS.DeleteBucketResult) => void): void;
  deleteBucket(params: COS.DeleteBucketParams): Promise<COS.DeleteBucketResult>;

  /**
   * 设置 Bucket 的 权限列表
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，可选
   * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantWrite - 赋予被授权者写取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   */
  putBucketAcl(params: COS.PutBucketAclParams, callback: (err: COS.CosError, data: COS.PutBucketAclResult) => void): void;
  putBucketAcl(params: COS.PutBucketAclParams): Promise<COS.PutBucketAclResult>;

  /**
   * 获取 Bucket 的 权限列表
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   * @returns data.AccessControlPolicy  访问权限信息
   */
  getBucketAcl(params: COS.GetBucketAclParams, callback: (err: COS.CosError, data: COS.GetBucketAclResult) => void): void;
  getBucketAcl(params: COS.GetBucketAclParams): Promise<COS.GetBucketAclResult>;

  /**
   * 设置 Bucket 的 跨域设置
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.CORSConfiguration - 相关的跨域设置，必须
   * @param params.CORSConfiguration.CORSRules - 对应的跨域规则
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                              返回的数据
   */
  putBucketCors(params: COS.PutBucketCorsParams, callback: (err: COS.CosError, data: COS.PutBucketCorsResult) => void): void;
  putBucketCors(params: COS.PutBucketCorsParams): Promise<COS.PutBucketCorsResult>;

  /**
   * 获取 Bucket 的 跨域设置
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   * @returns data.CORSRules            Bucket的跨域设置
   */
  getBucketCors(params: COS.GetBucketCorsParams, callback: (err: COS.CosError, data: COS.PutBucketCorsResult) => void): void;
  getBucketCors(params: COS.GetBucketCorsParams): Promise<COS.PutBucketCorsResult>;

  /**
   * 删除 Bucket 的 跨域设置
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                  返回的数据
   */
  deleteBucketCors(params: COS.DeleteBucketCorsParams, callback: (err: COS.CosError, data: COS.DeleteBucketCorsResult) => void): void;
  deleteBucketCors(params: COS.DeleteBucketCorsParams): Promise<COS.DeleteBucketCorsResult>;

  /**
   * 获取 Bucket 的 地域信息
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据，包含地域信息 LocationConstraint
   */
  getBucketLocation(params: COS.GetBucketLocationParams, callback: (err: COS.CosError, data: COS.GetBucketLocationResult) => void): void;
  getBucketLocation(params: COS.GetBucketLocationParams): Promise<COS.GetBucketLocationResult>;

  /**
   * 获取 Bucket 的读取权限策略
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  putBucketPolicy(params: COS.PutBucketPolicyParams, callback: (err: COS.CosError, data: COS.PutBucketPolicyResult) => void): void;
  putBucketPolicy(params: COS.PutBucketPolicyParams): Promise<COS.PutBucketPolicyResult>;

  /**
   * 获取 Bucket 的读取权限策略
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  getBucketPolicy(params: COS.GetBucketPolicyParams, callback: (err: COS.CosError, data: COS.GetBucketPolicyResult) => void): void;
  getBucketPolicy(params: COS.GetBucketPolicyParams): Promise<COS.GetBucketPolicyResult>;

  /**
   * 删除 Bucket 的 跨域设置
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                  返回的数据
   */
  deleteBucketPolicy(params: COS.DeleteBucketPolicyParams, callback: (err: COS.CosError, data: COS.DeleteBucketPolicyResult) => void): void;
  deleteBucketPolicy(params: COS.DeleteBucketPolicyParams): Promise<COS.DeleteBucketPolicyResult>;

  /**
   * 设置 Bucket 的标签
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.TagSet - 标签设置，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  putBucketTagging(params: COS.PutBucketTaggingParams, callback: (err: COS.CosError, data: COS.PutBucketTaggingResult) => void): void;
  putBucketTagging(params: COS.PutBucketTaggingParams): Promise<COS.PutBucketTaggingResult>;

  /**
   * 获取 Bucket 的标签设置
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  getBucketTagging(params: COS.GetBucketTaggingResult, callback: (err: COS.CosError, data: COS.GetBucketTaggingResult) => void): void;
  getBucketTagging(params: COS.GetBucketTaggingResult): Promise<COS.GetBucketTaggingResult>;

  /**
   * 删除 Bucket 的 标签设置
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  deleteBucketTagging(params: COS.DeleteBucketTaggingParams, callback: (err: COS.CosError, data: COS.DeleteBucketTaggingResult) => void): void;
  deleteBucketTagging(params: COS.DeleteBucketTaggingParams): Promise<COS.DeleteBucketTaggingResult>;


  /**
   * 设置 Bucket 生命周期
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  putBucketLifecycle(params: COS.PutBucketLifecycleParams, callback: (err: COS.CosError, data: COS.PutBucketLifecycleResult) => void): void;
  putBucketLifecycle(params: COS.PutBucketLifecycleParams): Promise<COS.PutBucketLifecycleResult>;

  /**
   *  获取 Bucket 生命周期
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  getBucketLifecycle(params: COS.GetBucketLifecycleParams, callback: (err: COS.CosError, data: COS.GetBucketLifecycleResult) => void): void;
  getBucketLifecycle(params: COS.GetBucketLifecycleParams): Promise<COS.GetBucketLifecycleResult>;

  /**
   * 删除 Bucket 生命周期
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  deleteBucketLifecycle(params: COS.DeleteBucketLifecycleParams, callback: (err: COS.CosError, data: COS.DeleteBucketLifecycleResult) => void): void;
  deleteBucketLifecycle(params: COS.DeleteBucketLifecycleParams): Promise<COS.DeleteBucketLifecycleResult>;

  /**
   * 设置 Bucket 版本
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  putBucketVersioning(params: COS.PutBucketVersioningParams, callback: (err: COS.CosError, data: COS.PutBucketVersioningResult) => void): void;
  putBucketVersioning(params: COS.PutBucketVersioningParams): Promise<COS.PutBucketVersioningResult>;

  /**
   * 获取 Bucket 版本
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  getBucketVersioning(params: COS.GetBucketVersioningParams, callback: (err: COS.CosError, data: COS.GetBucketVersioningResult) => void): void;
  getBucketVersioning(params: COS.GetBucketVersioningParams): Promise<COS.GetBucketVersioningResult>;

  /**
   * 设置 Bucket 副本
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  putBucketReplication(params: COS.PutBucketReplicationParams, callback: (err: COS.CosError, data: COS.PutBucketReplicationResult) => void): void;
  putBucketReplication(params: COS.PutBucketReplicationParams): Promise<COS.PutBucketReplicationResult>;

  /**
   * 获取 Bucket 副本
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  getBucketReplication(params: COS.GetBucketReplicationParams, callback: (err: COS.CosError, data: COS.GetBucketReplicationResult) => void): void;
  getBucketReplication(params: COS.GetBucketReplicationParams): Promise<COS.GetBucketReplicationResult>;

  /**
   * 删除 Bucket 副本
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  deleteBucketReplication(params: COS.DeleteBucketReplicationParams, callback: (err: COS.CosError, data: COS.DeleteBucketReplicationResult) => void): void;
  deleteBucketReplication(params: COS.DeleteBucketReplicationParams): Promise<COS.DeleteBucketReplicationResult>;

  /**
   * 设置 Bucket 静态网站配置信息
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.WebsiteConfiguration - 地域名称，必须
   * @param WebsiteConfiguration.IndexDocument - 索引文档，必须
   * @param WebsiteConfiguration.ErrorDocument - 错误文档，可选
   * @param WebsiteConfiguration.RedirectAllRequestsTo - 重定向所有请求，可选
   * @param params.RoutingRules - 重定向规则，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                                  返回数据
   */
  putBucketWebsite(params: COS.PutBucketWebsiteParams, callback: (err: COS.CosError, data: COS.PutBucketWebsiteResult) => void): void;
  putBucketWebsite(params: COS.PutBucketWebsiteParams): Promise<COS.PutBucketWebsiteResult>;

  /**
   * 获取 Bucket 的静态网站配置信息
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  getBucketWebsite(params: COS.GetBucketWebsiteParams, callback: (err: COS.CosError, data: COS.GetBucketWebsiteResult) => void): void;
  getBucketWebsite(params: COS.GetBucketWebsiteParams): Promise<COS.GetBucketWebsiteResult>;

  /**
   * 删除 Bucket 的静态网站配置
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  deleteBucketWebsite(params: COS.DeleteBucketWebsiteParams, callback: (err: COS.CosError, data: COS.DeleteBucketWebsiteResult) => void): void;
  deleteBucketWebsite(params: COS.DeleteBucketWebsiteParams): Promise<COS.DeleteBucketWebsiteResult>;

  /**
   * 设置 Bucket 的防盗链白名单或者黑名单
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.RefererConfiguration - 地域名称，必须
   * @param RefererConfiguration.Status - 是否开启防盗链，枚举值：Enabled、Disabled
   * @param RefererConfiguration.RefererType - 防盗链类型，枚举值：Black-List、White-List，必须
   * @param RefererConfiguration.DomianList.Domain - 生效域名，必须
   * @param RefererConfiguration.EmptyReferConfiguration 是否允许空 Referer 访问，枚举值：Allow、Deny，默认值为 Deny，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                                  返回数据
   */
  putBucketReferer(params: COS.PutBucketRefererParams, callback: (err: COS.CosError, data: COS.PutBucketRefererResult) => void): void;
  putBucketReferer(params: COS.PutBucketRefererParams): Promise<COS.PutBucketRefererResult>;

  /**
   * 获取 Bucket 的防盗链白名单或者黑名单
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  getBucketReferer(params: COS.GetBucketRefererParams, callback: (err: COS.CosError, data: COS.GetBucketRefererResult) => void): void;
  getBucketReferer(params: COS.GetBucketRefererParams): Promise<COS.GetBucketRefererResult>;

  /**
   * 设置 Bucket 自定义域名
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                                  返回数据
   */
  putBucketDomain(params: COS.PutBucketDomainParams, callback: (err: COS.CosError, data: COS.PutBucketDomainResult) => void): void;
  putBucketDomain(params: COS.PutBucketDomainParams): Promise<COS.PutBucketDomainResult>;

  /**
   * 获取 Bucket 的自定义域名
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  getBucketDomain(params: COS.GetBucketDomainParams, callback: (err: COS.CosError, data: COS.GetBucketDomainResult) => void): void;
  getBucketDomain(params: COS.GetBucketDomainParams): Promise<COS.GetBucketDomainResult>;

  /**
   * 删除 Bucket 自定义域名
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  deleteBucketDomain(params: COS.DeleteBucketDomainParams, callback: (err: COS.CosError, data: COS.DeleteBucketDomainResult) => void): void;
  deleteBucketDomain(params: COS.DeleteBucketDomainParams): Promise<COS.DeleteBucketDomainResult>;

  /**
   * 设置 Bucket 的回源
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                                  返回数据
   */
  putBucketOrigin(params: COS.PutBucketOriginParams, callback: (err: COS.CosError, data: COS.PutBucketOriginResult) => void): void;
  putBucketOrigin(params: COS.PutBucketOriginParams): Promise<COS.PutBucketOriginResult>;

  /**
   * 获取 Bucket 的回源
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  getBucketOrigin(params: COS.GetBucketOriginParams, callback: (err: COS.CosError, data: COS.GetBucketOriginResult) => void): void;
  getBucketOrigin(params: COS.GetBucketOriginParams): Promise<COS.GetBucketOriginResult>;

  /**
   * 删除 Bucket 的回源
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  deleteBucketOrigin(params: COS.DeleteBucketOriginParams, callback: (err: COS.CosError, data: COS.DeleteBucketOriginResult) => void): void;
  deleteBucketOrigin(params: COS.DeleteBucketOriginParams): Promise<COS.DeleteBucketOriginResult>;

  /**
   * 设置 Bucket 的日志记录
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.BucketLoggingStatus - 说明日志记录配置的状态，如果无子节点信息则意为关闭日志记录，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                                  返回数据
   */
  putBucketLogging(params: COS.PutBucketLoggingParams, callback: (err: COS.CosError, data: COS.PutBucketLoggingResult) => void): void;
  putBucketLogging(params: COS.PutBucketLoggingParams): Promise<COS.PutBucketLoggingResult>;

  /**
   * 获取 Bucket 的日志记录
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  getBucketLogging(params: COS.GetBucketLoggingParams, callback: (err: COS.CosError, data: COS.GetBucketLoggingResult) => void): void;
  getBucketLogging(params: COS.GetBucketLoggingParams): Promise<COS.GetBucketLoggingResult>;

  /**
   * 创建/编辑 Bucket 的清单任务
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Id - 清单任务的名称，必须
   * @param params.InventoryConfiguration - 包含清单的配置参数，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                                  返回数据
   */
  putBucketInventory(params: COS.PutBucketInventoryParams, callback: (err: COS.CosError, data: COS.PutBucketInventoryResult) => void): void;
  putBucketInventory(params: COS.PutBucketInventoryParams): Promise<COS.PutBucketInventoryResult>;

  /**
   * 获取 Bucket 的清单任务信息
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Id - 清单任务的名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  getBucketInventory(params: COS.GetBucketInventoryParams, callback: (err: COS.CosError, data: COS.GetBucketInventoryResult) => void): void;
  getBucketInventory(params: COS.GetBucketInventoryParams): Promise<COS.GetBucketInventoryResult>;

  /**
   * 获取 Bucket 的清单任务信息
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.ContinuationToken - 当 COS 响应体中 IsTruncated 为 true，且 NextContinuationToken 节点中存在参数值时，您可以将这个参数作为 continuation-token 参数值，以获取下一页的清单任务信息，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                              返回数据
   */
  listBucketInventory(params: COS.ListBucketInventoryParams, callback: (err: COS.CosError, data: COS.ListBucketInventoryResult) => void): void;
  listBucketInventory(params: COS.ListBucketInventoryParams): Promise<COS.ListBucketInventoryResult>;

  /**
   * 删除 Bucket 的清单任务
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Id - 清单任务的名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  deleteBucketInventory(params: COS.DeleteBucketInventoryParams, callback: (err: COS.CosError, data: COS.DeleteBucketInventoryResult) => void): void;
  deleteBucketInventory(params: COS.DeleteBucketInventoryParams): Promise<COS.DeleteBucketInventoryResult>;

  /**
   * 启用或者暂停存储桶的全球加速功能
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Id - 清单任务的名称，必须
   * @param params.InventoryConfiguration - 包含清单的配置参数，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                                  返回数据
   */
  putBucketAccelerate(params: COS.PutBucketAccelerateParams, callback: (err: COS.CosError, data: COS.PutBucketAccelerateResult) => void): void;
  putBucketAccelerate(params: COS.PutBucketAccelerateParams): Promise<COS.PutBucketAccelerateResult>;

  /**
   * 查询存储桶的全球加速功能配置
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Id - 清单任务的名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回数据
   */
  getBucketAccelerate(params: COS.GetBucketAccelerateParams, callback: (err: COS.CosError, data: COS.GetBucketAccelerateResult) => void): void;
  getBucketAccelerate(params: COS.GetBucketAccelerateParams): Promise<COS.GetBucketAccelerateResult>;

  /**
   * 取回对应Object的元数据，Head的权限与Get的权限一致
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - 文件名称，必须
   * @param params.IfModifiedSince - 当Object在指定时间后被修改，则返回对应Object元信息，否则返回304，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
   * @returns data.NotModified         是否在 IfModifiedSince 时间点之后未修改该 object，则为 true
   */
  headObject(params: COS.HeadObjectParams, callback: (err: COS.CosError, data: COS.HeadObjectResult) => void): void;
  headObject(params: COS.HeadObjectParams): Promise<COS.HeadObjectResult>;

  /**
   * 下载 object
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - 文件名称，必须
   * @param params.Output - 文件写入流，可选
   * @param params.IfModifiedSince - 当Object在指定时间后被修改，则返回对应Object元信息，否则返回304，可选
   * @param params.IfUnmodifiedSince - 如果文件修改时间早于或等于指定时间，才返回文件内容。否则返回 412 (precondition failed)，可选
   * @param params.IfMatch - 当 ETag 与指定的内容一致，才返回文件。否则返回 412 (precondition failed)，可选
   * @param params.IfNoneMatch - 当 ETag 与指定的内容不一致，才返回文件。否则返回304 (not modified)，可选
   * @param params.ResponseContentType - 设置返回头部中的 Content-Type 参数，可选
   * @param params.ResponseContentLanguage - 设置返回头部中的 Content-Language 参数，可选
   * @param params.ResponseExpires - 设置返回头部中的 Content-Expires 参数，可选
   * @param params.ResponseCacheControl - 设置返回头部中的 Cache-Control 参数，可选
   * @param params.ResponseContentDisposition - 设置返回头部中的 Content-Disposition 参数，可选
   * @param params.ResponseContentEncoding - 设置返回头部中的 Content-Encoding 参数，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
   * @returns data - 为对应的 object 数据，包括 body 和 headers
   */
  getObject(params: COS.GetObjectParams, callback: (err: COS.CosError, data: COS.GetObjectResult) => void): void;
  getObject(params: COS.GetObjectParams): Promise<COS.GetObjectResult>;

  /**
   * 下载 object，返回 Stream 对象
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - 文件名称，必须
   * @param params.Output - 文件写入流，可选
   * @param params.IfModifiedSince - 当Object在指定时间后被修改，则返回对应Object元信息，否则返回304，可选
   * @param params.IfUnmodifiedSince - 如果文件修改时间早于或等于指定时间，才返回文件内容。否则返回 412 (precondition failed)，可选
   * @param params.IfMatch - 当 ETag 与指定的内容一致，才返回文件。否则返回 412 (precondition failed)，可选
   * @param params.IfNoneMatch - 当 ETag 与指定的内容不一致，才返回文件。否则返回304 (not modified)，可选
   * @param params.ResponseContentType - 设置返回头部中的 Content-Type 参数，可选
   * @param params.ResponseContentLanguage - 设置返回头部中的 Content-Language 参数，可选
   * @param params.ResponseExpires - 设置返回头部中的 Content-Expires 参数，可选
   * @param params.ResponseCacheControl - 设置返回头部中的 Cache-Control 参数，可选
   * @param params.ResponseContentDisposition - 设置返回头部中的 Content-Disposition 参数，可选
   * @param params.ResponseContentEncoding - 设置返回头部中的 Content-Encoding 参数，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
   * @returns data - 为对应的 object 数据，包括 body 和 headers
   */
  getObjectStream(params: COS.GetObjectParams, callback?: (err: COS.CosError, data: COS.GetObjectResult) => void): Stream;

  /**
   * 上传 object
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - 文件名称，必须
   * @param params.Body - 传文件的内容，可以为 FileStream、字符串、Buffer，必须
   * @param params.CacheControl - RFC 2616 中定义的缓存策略，将作为 Object 元数据保存，可选
   * @param params.ContentDisposition - RFC 2616 中定义的文件名称，将作为 Object 元数据保存，可选
   * @param params.ContentEncoding - RFC 2616 中定义的编码格式，将作为 Object 元数据保存，可选
   * @param params.ContentLength - RFC 2616 中定义的 HTTP 请求内容长度（字节），必须
   * @param params.ContentType - RFC 2616 中定义的内容类型（MIME），将作为 Object 元数据保存，可选
   * @param params.Expires - RFC 2616 中定义的过期时间，将作为 Object 元数据保存，可选
   * @param params.Expect - 当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容，可选
   * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，可选
   * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.StorageClass - 设置对象的存储级别，枚举值：STANDARD、STANDARD_IA、ARCHIVE，默认值：STANDARD，可选
   * @param params.x-cos-meta-* - 允许用户自定义的头部信息，将作为对象的元数据保存。大小限制2KB，可选
   * @param params.ContentSha1 - RFC 3174 中定义的 160-bit 内容 SHA-1 算法校验，可选
   * @param params.ServerSideEncryption - 支持按照指定的加密算法进行服务端数据加密，格式 x-cos-server-side-encryption: "AES256"，可选
   * @param params.onTaskReady - 任务准备完成之后，会把 taskId 通过这个回调返回
   * @param params.onProgress - 上传进度回调函数
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                          为对应的 object 数据
   * @returns data.ETag                                 为对应上传文件的 ETag 值
   * @returns data.Location                                 为对应上传文件不带 https:// 的 url 值，例如 testbucket-1250000000.cos.ap-beijing.myqcloud.com/folder/1.jpg
   */
  putObject(params: COS.PutObjectParams, callback: (err: COS.CosError, data: COS.PutObjectResult) => void): void;
  putObject(params: COS.PutObjectParams): Promise<COS.PutObjectResult>;

  /**
   * 删除 object
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err - 请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data - 删除操作成功之后返回的数据
   */
  deleteObject(params: COS.DeleteObjectParams, callback: (err: COS.CosError, data: COS.DeleteObjectResult) => void): void;
  deleteObject(params: COS.DeleteObjectParams): Promise<COS.DeleteObjectResult>;

  /**
   * 批量删除 object
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Objects - 要删除的对象列表，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err - 请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data - 删除操作成功之后返回的数据
   */
  deleteMultipleObject(params: COS.DeleteMultipleObjectParams, callback: (err: COS.CosError, data: COS.DeleteMultipleObjectResult) => void): void;
  deleteMultipleObject(params: COS.DeleteMultipleObjectParams): Promise<COS.DeleteMultipleObjectResult>;

  /**
   * 获取 object 的 权限列表
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   * @returns data.AccessControlPolicy  权限列表
   */
  getObjectAcl(params: COS.GetObjectAclParams, callback: (err: COS.CosError, data: COS.GetObjectAclResult) => void): void;
  getObjectAcl(params: COS.GetObjectAclParams): Promise<COS.GetObjectAclResult>;

  /**
   * 设置 object 的 权限列表
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  putObjectAcl(params: COS.PutObjectAclParams, callback: (err: COS.CosError, data: COS.PutObjectAclResult) => void): void;
  putObjectAcl(params: COS.PutObjectAclParams): Promise<COS.PutObjectAclResult>;

  /**
   * Options Object请求实现跨域访问的预请求。即发出一个 OPTIONS 请求给服务器以确认是否可以进行跨域操作。
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  optionsObject(params: COS.OptionsObjectParams, callback: (err: COS.CosError, data: COS.OptionsObjectResult) => void): void;
  optionsObject(params: COS.OptionsObjectParams): Promise<COS.OptionsObjectResult>;

  /**
   * 恢复归档对象
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.RestoreRequest - object 用于恢复数据的容器，必须
   * @param params.RestoreRequest.Days - object 设置临时副本的过期时间，必须
   * @param params.RestoreRequest.CASJobParameters.Tier - Standard（标准模式，恢复任务在3 - 5小时内完成），Expedited（极速模式，恢复任务在15分钟内可完成），Bulk（批量模式，恢复任务在5 - 12小时内完成），必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  restoreObject(params: COS.RestoreObjectParams, callback: (err: COS.CosError, data: COS.RestoreObjectResult) => void): void;
  restoreObject(params: COS.RestoreObjectParams): Promise<COS.RestoreObjectResult>;

  /**
   * 检索对象内容
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.SelectType - 代表接口版本信息，当前固定传入 2，必须
   * @param params.SelectRequest - 查询参数对象，具体参数格式请看文档 https://cloud.tencent.com/document/product/436/37641
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  selectObjectContent(params: COS.SelectObjectContentParams, callback: (err: COS.CosError, data: COS.SelectObjectContentResult) => void): void;
  selectObjectContent(params: COS.SelectObjectContentParams): Promise<COS.SelectObjectContentResult>;

  /**
   * 检索对象内容，返回 Stream 对象
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.SelectType - 代表接口版本信息，当前固定传入 2，必须
   * @param params.SelectRequest - 查询参数对象，具体参数格式请看文档 https://cloud.tencent.com/document/product/436/37641
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  selectObjectContentStream(params: COS.SelectObjectContentParams, callback?: (err: COS.CosError, data: COS.SelectObjectContentResult) => void): Stream;

  /**
   * 复制对象
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket 名称
   * @param params.Region - 地域名称
   * @param params.Key - 文件名称
   * @param params.CopySource - 源文件URL绝对路径，可以通过versionid子资源指定历史版本
   * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，可选
   * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.StorageClass	设置对象的存储级别，枚举值：STANDARD、STANDARD_IA、ARCHIVE，默认值：STANDARD	String	否
   * @param params.MetadataDirective - 是否拷贝元数据，枚举值：Copy, Replaced，默认值Copy。假如标记为Copy，忽略Header中的用户元数据信息直接复制；假如标记为Replaced，按Header信息修改元数据。当目标路径和原路径一致，即用户试图修改元数据时，必须为Replaced
   * @param params.CopySourceIfModifiedSince - 当Object在指定时间后被修改，则执行操作，否则返回412。可与x-cos-copy-source-If-None-Match一起使用，与其他条件联合使用返回冲突。
   * @param params.CopySourceIfUnmodifiedSince - 当Object在指定时间后未被修改，则执行操作，否则返回412。可与x-cos-copy-source-If-Match一起使用，与其他条件联合使用返回冲突。
   * @param params.CopySourceIfMatch - 当Object的Etag和给定一致时，则执行操作，否则返回412。可与x-cos-copy-source-If-Unmodified-Since一起使用，与其他条件联合使用返回冲突。
   * @param params.CopySourceIfNoneMatch - 当Object的Etag和给定不一致时，则执行操作，否则返回412。可与x-cos-copy-source-If-Modified-Since一起使用，与其他条件联合使用返回冲突。
   * @param params.StorageClass - 存储级别，枚举值：存储级别，枚举值：Standard, Standard_IA，Archive；默认值：Standard
   * @param params.CacheControl - 指定所有缓存机制在整个请求/响应链中必须服从的指令。
   * @param params.ContentDisposition - MIME 协议的扩展，MIME 协议指示 MIME 用户代理如何显示附加的文件
   * @param params.ContentEncoding - HTTP 中用来对「采用何种编码格式传输正文」进行协定的一对头部字段
   * @param params.ContentLength - 设置响应消息的实体内容的大小，单位为字节
   * @param params.ContentType - RFC 2616 中定义的 HTTP 请求内容类型（MIME），例如text/plain
   * @param params.Expires - 响应过期的日期和时间
   * @param params.Expect - 请求的特定的服务器行为
   * @param params.ServerSideEncryption - 支持按照指定的加密算法进行服务端数据加密，格式 x-cos-server-side-encryption: "AES256"，可选
   * @param params['x-cos-meta-*'] - 允许用户自定义的头部信息，将作为 Object 元数据返回。大小限制2K。
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                       请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                      返回的数据
   */
  putObjectCopy(params: COS.PutObjectCopyParams, callback: (err: COS.CosError, data: COS.PutObjectCopyResult) => void): void;
  putObjectCopy(params: COS.PutObjectCopyParams): Promise<COS.PutObjectCopyResult>;

  /**
   * 设置对象标签
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.Tags - 要设置的标签列表，例如 [{Key: 'k1', Value: 'v1'}]，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  putObjectTagging(params: COS.PutObjectTaggingParams, callback: (err: COS.CosError, data: COS.PutObjectTaggingResult) => void): void;
  putObjectTagging(params: COS.PutObjectTaggingParams): Promise<COS.PutObjectTaggingResult>;

  /**
   * 查询对象标签
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   * @returns data.Tags         返回的标签列表 [{Key: 'k1', Value: 'v1'}]
   */
  getObjectTagging(params: COS.GetObjectTaggingParams, callback: (err: COS.CosError, data: COS.GetObjectTaggingResult) => void): void;
  getObjectTagging(params: COS.GetObjectTaggingParams): Promise<COS.GetObjectTaggingResult>;

  /**
   * 删除对象标签
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data              返回的数据
   */
  deleteObjectTagging(params: COS.DeleteObjectTaggingParams, callback: (err: COS.CosError, data: COS.DeleteObjectTaggingResult) => void): void;
  deleteObjectTagging(params: COS.DeleteObjectTaggingParams): Promise<COS.DeleteObjectTaggingResult>;

  /**
   * 初始化分块上传
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.CacheControl	RFC 2616 中定义的缓存策略，将作为对象的元数据保存	String	否
   * @param params.ContentDisposition	RFC 2616 中定义的文件名称，将作为对象的元数据保存	String	否
   * @param params.ContentEncoding	RFC 2616 中定义的编码格式，将作为对象的元数据保存	String	否
   * @param params.ContentType	RFC 2616 中定义的内容类型（MIME），将作为对象的元数据保存	String	否
   * @param params.Expires	RFC 2616 中定义的过期时间，将作为对象的元数据保存	String	否
   * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，可选
   * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.StorageClass	设置对象的存储级别，枚举值：STANDARD、STANDARD_IA、ARCHIVE，默认值：STANDARD	String	否
   * @param params['x-cos-meta-*']	允许用户自定义的头部信息，将作为对象的元数据返回。大小限制2KB	String	否
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                       请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                      返回的数据
   */
  multipartInit(params: COS.MultipartInitParams, callback: (err: COS.CosError, data: COS.MultipartInitResult) => void): void;
  multipartInit(params: COS.MultipartInitParams): Promise<COS.MultipartInitResult>;

  /**
   * 分块上传
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.ContentLength - RFC 2616 中定义的 HTTP 请求内容长度（字节），可选
   * @param params.Expect - 当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容，可选
   * @param params.ServerSideEncryption - 支持按照指定的加密算法进行服务端数据加密，格式 x-cos-server-side-encryption: "AES256"，可选
   * @param params.ContentSha1 - RFC 3174 中定义的 160-bit 内容 SHA-1 算法校验值，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                              返回的数据
   * @returns data.ETag                         返回的文件分块 sha1 值
   */
  multipartUpload(params: COS.MultipartUploadParams, callback: (err: COS.CosError, data: COS.MultipartUploadResult) => void): void;
  multipartUpload(params: COS.MultipartUploadParams): Promise<COS.MultipartUploadResult>;

  /**
   * 分块上传
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - 对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述	String，必选
   * @param params.CopySource - 源对象 URL 路径，可以通过 URL 参数 ?versionId=<versionId> 参数指定指定历史版本	String，必选
   * @param params.UploadId - 使用上传分块文件，必须先初始化分块上传。在初始化分块上传的响应中，会返回一个唯一的描述符（upload ID），您需要在分块上传请求中携带此 ID	String，必选
   * @param params.PartNumber - 分块拷贝的块号	String，必选
   * @param params.CopySourceRange - 源对象的字节范围，范围值必须使用 bytes=first-last 格式，first 和 last 都是基于0开始的偏移量。例如 bytes=0-9 表示您希望拷贝源对象的开头10个字节的数据 ，如果不指定，则表示拷贝整个对象	String，可选
   * @param params.CopySourceIfMatch - 当对象的 Etag 和给定一致时，则执行操作，否则返回412，可与 x-cos-copy-source-If-Unmodified-Since 一起使用，与其他条件联合使用返回冲突	String，可选
   * @param params.CopySourceIfNoneMatch - 当对象的 Etag 和给定不一致时，则执行操作，否则返回412，可与 x-cos-copy-source-If-Modified-Since 一起使用，与其他条件联合使用返回冲突	String，可选
   * @param params.CopySourceIfUnmodifiedSince - 当对象在指定时间后未被修改，则执行操作，否则返回412，可与 x-cos-copy-source-If-Match 一起使用，与其他条件联合使用返回冲突	String，可选
   * @param params.CopySourceIfModifiedSince - 当对象在指定时间后被修改，则执行操作，否则返回412，可与 x-cos-copy-source-If-None-Match 一起使用，与其他条件联合使用返回冲突	String，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                              返回的数据
   * @returns data.ETag                         返回的文件分块 sha1 值
   */
  uploadPartCopy(params: COS.UploadPartCopyParams, callback: (err: COS.CosError, data: COS.UploadPartCopyResult) => void): void;
  uploadPartCopy(params: COS.UploadPartCopyParams): Promise<COS.UploadPartCopyResult>;

  /**
   * 完成分块上传
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.Parts - 分块信息列表，必须
   * @param params.Parts[i].PartNumber - 块编号，必须
   * @param params.Parts[i].ETag - 分块的 sha1 校验值
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                              返回的数据
   * @returns data.CompleteMultipartUpload  完成分块上传后的文件信息，包括Location, Bucket, Key 和 ETag
   */
  multipartComplete(params: COS.MultipartCompleteParams, callback: (err: COS.CosError, data: COS.MultipartCompleteResult) => void): void;
  multipartComplete(params: COS.MultipartCompleteParams): Promise<COS.MultipartCompleteResult>;

  /**
   * 分块上传任务列表查询
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Delimiter - 定界符为一个符号，如果有Prefix，则将Prefix到delimiter之间的相同路径归为一类，定义为Common Prefix，然后列出所有Common Prefix。如果没有Prefix，则从路径起点开始，可选
   * @param params.EncodingType - 规定返回值的编码方式，可选
   * @param params.Prefix - 前缀匹配，用来规定返回的文件前缀地址，可选
   * @param params.MaxUploads - 单次返回最大的条目数量，默认1000，可选
   * @param params.KeyMarker - 与upload-id-marker一起使用 </Br>当upload-id-marker未被指定时，ObjectName字母顺序大于key-marker的条目将被列出 </Br>当upload-id-marker被指定时，ObjectName字母顺序大于key-marker的条目被列出，ObjectName字母顺序等于key-marker同时UploadId大于upload-id-marker的条目将被列出，可选
   * @param params.UploadIdMarker - 与key-marker一起使用 </Br>当key-marker未被指定时，upload-id-marker将被忽略 </Br>当key-marker被指定时，ObjectName字母顺序大于key-marker的条目被列出，ObjectName字母顺序等于key-marker同时UploadId大于upload-id-marker的条目将被列出，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                  返回的数据
   * @returns data.ListMultipartUploadsResult   分块上传任务信息
   */
  multipartList(params: COS.MultipartListParams, callback: (err: COS.CosError, data: COS.MultipartListResult) => void): void;
  multipartList(params: COS.MultipartListParams): Promise<COS.MultipartListResult>;

  /**
   * 上传的分块列表查询
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.UploadId - 标示本次分块上传的ID，必须
   * @param params.EncodingType - 规定返回值的编码方式，可选
   * @param params.MaxParts - 单次返回最大的条目数量，默认1000，可选
   * @param params.PartNumberMarker - 默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                  返回的数据
   * @returns data.ListMultipartUploadsResult   分块信息
   */
  multipartListPart(params: COS.MultipartListPartParams, callback: (err: COS.CosError, data: COS.MultipartListPartResult) => void): void;
  multipartListPart(params: COS.MultipartListPartParams): Promise<COS.MultipartListPartResult>;

  /**
   * 抛弃分块上传
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.UploadId - 标示本次分块上传的ID，必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data            返回的数据
   */
  multipartAbort(params: COS.MultipartAbortParams, callback: (err: COS.CosError, data: COS.MultipartAbortResult) => void): void;
  multipartAbort(params: COS.MultipartAbortParams): Promise<COS.MultipartAbortResult>;

  /**
   * 分片上传文件，封装好分片上传的多个步骤的上传方法。
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.FilePath - object名称，必须
   * @param params.Query - 请求的 url 参数对象，可选
   * @param params.Headers - 请求的头部参数对象，可选
   * @param params.CacheControl	RFC 2616中定义的缓存策略，将作为对象的元数据保存	String	否
   * @param params.ContentDisposition	RFC 2616中定义的文件名称，将作为对象的元数据保存	String	否
   * @param params.ContentEncoding	RFC 2616中定义的编码格式，将作为对象的元数据保存	String	否
   * @param params.ContentLength	RFC 2616中定义的 HTTP 请求内容长度（字节）	String	否
   * @param params.ContentType	RFC 2616中定义的内容类型（MIME），将作为对象的元数据保存	String	否
   * @param params.Expires	RFC 2616中定义的过期时间，将作为对象的元数据保存	String	否
   * @param params.Expect	当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容	String	否
   * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，可选
   * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，可选
   * @param params.StorageClass	设置对象的存储级别，枚举值：STANDARD、STANDARD_IA、ARCHIVE，默认值：STANDARD	String	否
   * @param params['x-cos-meta-*']	允许用户自定义的头部信息，将作为对象的元数据保存，大小限制2KB	String	否
   * @param params.onTaskReady	上传任务创建时的回调函数，返回一个 taskId，唯一标识上传任务，可用于上传任务的取消（cancelTask），停止（pauseTask）和重新开始（restartTask）	Function	否
   * @param params.onProgress	进度的回调函数，进度回调响应对象（progressData）属性如下	Function	否
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data            返回的数据
   */
  sliceUploadFile(params: COS.SliceUploadFileParams, callback: (err: COS.CosError, data: COS.SliceUploadFileResult) => void): void;
  sliceUploadFile(params: COS.SliceUploadFileParams): Promise<COS.SliceUploadFileResult>;

  /**
   * 分片上传文件，封装好分片上传的多个步骤的上传方法。
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.Level - 清理任务的级别，枚举值 task（只清理单个 UploadId）、file（列出指定对象的所有 UploadId 并清理）、bucket（列出存储桶的所有 UploadId 并清理）'，可选
   * @param params.UploadId - 当 Level 传 task 时，必需传入 UploadId
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data            返回的数据
   */
  abortUploadTask(params: COS.AbortUploadTaskParams, callback: (err: COS.CosError, data: COS.AbortUploadTaskResult) => void): void;
  abortUploadTask(params: COS.AbortUploadTaskParams): Promise<COS.AbortUploadTaskResult>;

  /**
   * 分片复制文件
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.FilePath - 请求的方法，可选
   * @param params.onProgress - 签名超时时间，单位秒，可选
   * @param params.onFileFinish - 请求头部，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data            返回的数据
   */
  uploadFiles(params: COS.UploadFilesParams, callback: (err: COS.CosError, data: COS.UploadFilesResult) => void): void;
  uploadFiles(params: COS.UploadFilesParams): Promise<COS.UploadFilesResult>;

  /**
   * 分片复制文件
   * @returns taskList  返回上传任务列表
   */
  sliceCopyFile(params: COS.SliceCopyFileParams, callback: (err: COS.CosError, data: COS.SliceCopyFileResult) => void): void;
  sliceCopyFile(params: COS.SliceCopyFileParams): Promise<COS.SliceCopyFileResult>;

  /**
   * 获取上传任务列表
   * @returns taskList  返回上传任务列表
   */
  getTaskList(): COS.TaskList;

  /**
   * 判断上传队列是否有未完成的任务
   * @param taskId - 上传队列的任务 id，必须
   */
  pauseTask(taskId: COS.TaskId): void;

  /**
   * 判断上传队列是否有未完成的任务
   * @param taskId - 上传队列的任务 id，必须
   */
  restartTask(taskId: COS.TaskId): void;

  /**
   * 判断上传队列是否有未完成的任务
   * @param taskId - 上传队列的任务 id，必须
   */
  cancelTask(taskId: COS.TaskId): void;

  /**
   * 判断上传队列是否有未完成的任务
   * @returns isRunning  返回上传队列是否有任务未完成，true 有未完成任务，false 没有未完成任务
   */
  isUploadRunning(): boolean;

  /**
   * 获取文件下载链接
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - object名称，必须
   * @param params.Method - 请求的方法，可选
   * @param params.Expires - 签名超时时间，单位秒，可选
   * @param params.Headers - 请求头部，可选
   * @param params.Query - 请求 Url 参数，可选
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data            返回的数据
   */
  getObjectUrl(params: COS.GetObjectUrlParams, callback: (err: COS.CosError, data: COS.GetObjectUrlResult) => void): string;
  getObjectUrl(params: COS.GetObjectUrlParams): Promise<COS.GetObjectUrlResult>;

  /**
   * 获取 COS JSON API (v4) 签名
   * @param params - 参数对象，必须
   * @param params.Bucket - 请求的存储桶，必须
   * @param params.Key - object名称，必须
   * @param params.Expires - 名超时时间，单位秒，可选
   * @param params.SecretId - 计算签名用的密钥 SecretId，如果不传会用实例本身的凭证，可选
   * @param params.SecretKey - 计算签名用的密钥 SecretId，如果不传会用实例本身的凭证，可选
   * @returns authorization              返回签名字符串
   */
  getV4Auth(params: COS.GetV4AuthParams): COS.Authorization;

  /**
   * 获取签名
   * @param params - 参数对象，可选
   * @param params.Method - 请求方法，可选
   * @param params.Key - 请求对象，最前面不带 /，如果是存储桶接口，传入空字符串，可选
   * @param params.Expires - 名超时时间，单位秒，可选
   * @param params.Query - 请求 url 参数对象，可选
   * @param params.Headers - 请求头部对象，可选
   * @param params.SecretId - 计算签名用的密钥 SecretId，如果不传会用实例本身的凭证，可选
   * @param params.SecretKey - 计算签名用的密钥 SecretId，如果不传会用实例本身的凭证，可选
   * @returns authorization              返回签名字符串
   */
  getAuth(params: COS.GetAuthParams): COS.Authorization;

}

export = COS;
