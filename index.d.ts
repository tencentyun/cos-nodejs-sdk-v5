/**
 * 参考模版
 * https://www.tslang.cn/docs/handbook/declaration-files/templates/module-class-d-ts.html
 */

declare namespace COS {

  // 外部类型
  export type Buffer = any; // nodejs Buffer
  export type Stream = any; // nodejs Stream

  // API 相关
  export type Query = Record<string, any>;
  export type Headers = Record<string, any>;
  export type Method = | 'get' | 'GET' | 'delete' | 'DELETE' | 'post' | 'POST' | 'put' | 'PUT' | 'patch' | 'PATCH';
  export type Params = Record<string, any>;
  export type Scope = { action: string, bucket: string, region: string, prefix: string }[];
  export type Owner = Record<string, any>;
  export type Grants = any[];
  export type CORSRules = Record<string, any>[];
  export type LocationConstraint = any;
  export type Policy = any;
  export type Tag = any;
  export type LifecycleRule = any;
  export type VersioningConfiguration = Record<string, any>;
  export type ReplicationConfiguration = Record<string, any>;
  export type ReplicationRule = any;
  export type DeleteMarker = any;
  export type ObjectVersion = any;
  export type WriteStream = any;
  export type AccessControlPolicy = any;
  export type WebsiteConfiguration = {
    IndexDocument: Record<string, any>;
    ErrorDocument?: Record<string, any>;
    RedirectAllRequestsTo?: Record<string, any>;
    RoutingRules?: any[];
  };
  export type CopyPartResult = any;
  export type COSObject = any;
  export type RestoreRequest = any;
  export type InitiateMultipartUploadResult = Record<string, any>;
  export type Part = {
    PartNumber: string;
    ETag: string;
  };
  export type CompleteMultipartUploadResult = Record<string, any>;
  export type ListMultipartUploadsResult = {
    CommonPrefixes: any[];
    Upload: any[];
  };
  export type Credentials = {
    tmpSecretId: string;
    tmpSecretKey: string;
    sessionToken: string;
  };
  export type AuthResData = {
    credentials: {
      tmpSecretId: string;
      tmpSecretKey: string;
      sessionToken: string;
    };
    startTime: number;
    expiredTime: number;
  };
  export type onProgress = (params: {
    loaded: number,
    total: number,
    speed: number,
    percent: number
  }) => any

  export type ParamsCommon = { Headers: Headers};

  // API Response 相关
  export interface APIResCommonData {
    statusCode?: number;
    headers?: Headers;
  }
  export type APIResError = null | {
    statusCode?: number;
    headers?: Headers;
    error: string | Error | { Code: string, Message: string }
  };

  export interface COSOptions {
    SecretId?: string;
    SecretKey?: string;
    XCosSecurityToken?: string;
    ChunkRetryTimes?: number;
    FileParallelLimit?: number;
    ChunkParallelLimit?: number;
    ChunkSize?: number;
    SliceSize?: number;
    CopyChunkParallelLimit?: number;
    CopyChunkSize?: number;
    CopySliceSize?: number;
    MaxPartNumber?: number;
    ProgressInterval?: number;
    UploadQueueSize?: number;
    Domain?: string;
    ServiceDomain?: string;
    Protocol?: string;
    CompatibilityMode?: boolean;
    ForcePathStyle?: boolean;
    UseRawKey?: boolean;
    Timeout?: number; // Unit: ms
    CorrectClockSkew?: boolean;
    SystemClockOffset?: number; // Unit: ms
    UploadCheckContentMd5?: boolean;
    UploadAddMetaMd5?: boolean;
    UploadIdCacheLimit?: number;
    ConfCwd?: string;
    /**
     * 获取临时密钥
     */
    getAuthorization?: (
      options: {
        Bucket: string;
        Region: string;
        Method: Method;
        Key: string;
        Pathname: string;
        Query: Query;
        Headers: Headers;
        Scope: Scope;
      },
      callback: (
        params: string | {
          TmpSecretId: string;
          TmpSecretKey: string;
          XCosSecurityToken: string;
          StartTime: number;
          ExpiredTime: number;
          ScopeLimit?: boolean;
        }
      ) => void
    ) => void;
  }

  export interface StaticGetAuthOptions {
    SecretId?: string;
    SecretKey?: string;
    KeyTime?: string;
    Method?: Method;
    method?: Method;
    Query?: Query;
    params?: Params;
    Headers?: Headers;
    headers?: Headers;
    Key?: string;
    UseRawKey?: boolean;
    Pathname?: string;
    pathname?: string;
    Expires?: number;
    expires?: number;
  }

  class COS {
    // 构造方法
    constructor(options: COS.COSOptions);

    // 静态属性
    static version: string;

    // 静态方法
    static getAuthorization: (options: COS.StaticGetAuthOptions) => string;

    /**
     * 获取用户的 bucket 列表
     * @param params - 回调函数，必须，下面为参数列表
     * 无特殊参数
     * @param callback - 回调函数，必须
     */
    getService(
      params: ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Buckets: object;
          Owner: object;
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 创建 Bucket，并初始化访问权限
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，非必须
     * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantWrite - 赋予被授权者写取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          返回的数据
     * @returns data.Location             操作地址
     */
    putBucket(
      params: {
        Bucket: string;
        Region: string;
        ACL?: string;
        GrantRead?: string;
        GrantWrite?: string;
        GrantReadAcp?: string;
        GrantWriteAcp?: string;
        GrantFullControl?: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Location: string
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 查看是否存在该Bucket，是否有权限访问
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err                       请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                      返回的数据
     * @returns data.BucketExist     Bucket是否存在
     * @returns data.BucketAuth      是否有 Bucket 的访问权限
     */
    headBucket(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          BucketExist: boolean;
          BucketAuth: boolean;
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 获取 Bucket 下的 object 列表
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Prefix - 前缀匹配，用来规定返回的文件前缀地址，非必须
     * @param params.Delimiter - 定界符为一个符号，如果有Prefix，则将Prefix到delimiter之间的相同路径归为一类，非必须
     * @param params.Marker - 默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，非必须
     * @param params.MaxKeys - 单次返回最大的条目数量，默认1000，非必须
     * @param params.EncodingType - 规定返回值的编码方式，非必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          返回的数据
     * @returns data.Contents     返回的 object 列表信息
     * @returns data.CommonPrefixes     返回的公共前缀列表信息，类似当前目录下的子目录列表，如果传入了 Delimiter 就会返回该列表
     * @returns data.NextMarker     继续列出文件的时候要传入的 Marker
     * @returns data.NextVersionIdMarker     继续列出文件的时候要传入的 VersionIdMarker
     */
    getBucket(
      params: {
        Bucket: string;
        Region: string;
        Prefix: string;
        Delimiter?: '/' | string;
        Marker?: string;
        MaxKeys?: string;
        EncodingType?: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Contents: {
            Key: string,
            LastModified: string,
            ETag: string,
            Size: string,
            StorageClass: string,
            StorageTier?: string,
            Owner: object,
          }[]
          CommonPrefixes: {
            Prefix: string,
          }[],
          IsTruncated: 'false' | 'true',
          NextMarker?: string,
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 获取 Bucket 下的 object 版本列表
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Prefix - 前缀匹配，用来规定返回的文件前缀地址，非必须
     * @param params.Delimiter - 定界符为一个符号，如果有Prefix，则将Prefix到delimiter之间的相同路径归为一类，非必须
     * @param params.Marker - 默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，非必须
     * @param params.MaxKeys - 单次返回最大的条目数量，默认1000，非必须
     * @param params.VersionIdMarker - 起始版本 ID 标记，从该标记之后（不含）返回对象版本条目，如果上一次 List 结果的 NextVersionIdMarker 为空，则该参数也指定为空，非必须
     * @param params.EncodingType - 规定返回值的编码方式，非必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          返回的数据
     * @returns data.Contents     返回的 object 列表信息
     * @returns data.CommonPrefixes     返回的公共前缀列表信息，类似当前目录下的子目录列表，如果传入了 Delimiter 就会返回该列表
     * @returns data.IsTruncated     返回的 object 列表信息
     * @returns data.NextMarker     继续列出文件的时候要传入的 Marker
     * @returns data.NextVersionIdMarker     继续列出文件的时候要传入的 VersionIdMarker
     */
    listObjectVersions(
      params: {
        Bucket: string;
        Region: string;
        Prefix: string;
        Delimiter?: '/' | string;
        Marker?: string;
        MaxKeys?: string;
        VersionIdMarker?: string;
        EncodingType?: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Contents: {
            Key: string,
            VersionId: string,
            IsLatest: 'false' | 'true',
            LastModified: string,
            ETag: string,
            Size: string,
            StorageClass: string,
            StorageTier?: string,
            Owner: string,
          }[]
          CommonPrefixes: {
            Prefix: string,
          }[],
          IsTruncated: 'false' | 'true',
          NextMarker?: string,
          NextVersionIdMarker?: string,
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 删除 Bucket
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                  返回的数据
     * @returns data.Location     操作地址
     */
    deleteBucket(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 设置 Bucket 的 权限列表
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，非必须
     * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantWrite - 赋予被授权者写取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          返回的数据
     */
    putBucketAcl(
      params: {
        Bucket: string;
        Region: string;
        ACL?: string;
        GrantRead?: string;
        GrantWrite: string;
        GrantReadAcp?: string;
        GrantWriteAcp?: string;
        GrantFullControl?: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取 Bucket 的 权限列表
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          返回的数据
     * @returns data.AccessControlPolicy  访问权限信息
     */
    getBucketAcl(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          GrantFullControl: object;
          GrantWrite: object;
          GrantRead: object;
          GrantReadAcp: object;
          GrantWriteAcp: object;
          ACL: string;
          Owner: object;
          Grants: object
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 设置 Bucket 的 跨域设置
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.CORSConfiguration - 相关的跨域设置，必须
     * @param params.CORSConfiguration.CORSRules - 对应的跨域规则
     * @param callback - 回调函数，必须
     * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                              返回的数据
     */
    putBucketCors(
      params: {
        Bucket: string;
        Region: string;
        CORSRules: {
          AllowedOrigin: string[]
          AllowedMethod: string[]
          AllowedHeader?: string[]
          ExposeHeader?: string[]
          MaxAgeSeconds?: number,
        }[];
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取 Bucket 的 跨域设置
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          返回的数据
     * @returns data.CORSRules            Bucket的跨域设置
     */
    getBucketCors(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          CORSRules: object;
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 删除 Bucket 的 跨域设置
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                  返回的数据
     */
    deleteBucketCors(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取 Bucket 的 地域信息
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据，包含地域信息 LocationConstraint
     */
    getBucketLocation(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          LocationConstraint;
        }
      ) => void
    ): void;

    /**
     * 获取 Bucket 的读取权限策略
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    putBucketPolicy(
      params: {
        Bucket: string;
        Region: string;
        Policy: {
          version?: string,
          statement: {
            effect: 'allow' | 'deny',
            principal: object,
            action: string[],
            resource: string[],
            condition?: object,
          }[] | object,
        },
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Policy: object
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 获取 Bucket 的读取权限策略
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    getBucketPolicy(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Policy: {
            version: string,
            Statement: {
              effect: 'allow' | 'deny',
              principal: object,
              action: string[],
              resource: string[],
              condition?: object,
            }[],
          }
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 删除 Bucket 的 跨域设置
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                  返回的数据
     */
    deleteBucketPolicy(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 设置 Bucket 的标签
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.TagSet - 标签设置，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    putBucketTagging(
      params: {
        Bucket: string;
        Region: string;
        Tags: {
          Key: string,
          Value: string,
        }[];
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取 Bucket 的标签设置
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    getBucketTagging(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Tags: {
            Key: string,
            Value: string,
          }[]
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 删除 Bucket 的 标签设置
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回的数据
     */
    deleteBucketTagging(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 设置 Bucket 静态网站配置信息
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.WebsiteConfiguration - 地域名称，必须
     * @param WebsiteConfiguration.IndexDocument - 索引文档，必须
     * @param WebsiteConfiguration.ErrorDocument - 错误文档，非必须
     * @param WebsiteConfiguration.RedirectAllRequestsTo - 重定向所有请求，非必须
     * @param params.RoutingRules - 重定向规则，非必须
     * @param callback - 回调函数，必须
     * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                                  返回数据
     */
    putBucketWebsite(
      params: {
        Bucket: string;
        Region: string;
        WebsiteConfiguration: {
          IndexDocument: {
            Suffix: string,
          };
          RedirectAllRequestsTo?: {
            Protocol: "https" | string
          };
          AutoAddressing?: {
            Status: 'Disabled' | 'Enabled'
          },
          ErrorDocument?: {
            Key: string,
            OriginalHttpStatus?: string
          };
          RoutingRules?: {
            Condition: {
              HttpErrorCodeReturnedEquals?: string | number,
              KeyPrefixEquals?: 'Enabled' | 'Disabled',
            },
            Redirect: {
              Protocol?: 'https' | string,
              ReplaceKeyWith?: string,
              ReplaceKeyPrefixWith?: string,
            },
          }[];
        };
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取 Bucket 的静态网站配置信息
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    getBucketWebsite(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          WebsiteConfiguration: object
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 删除 Bucket 的静态网站配置
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    deleteBucketWebsite(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 设置 Bucket 的防盗链白名单或者黑名单
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.RefererConfiguration - 地域名称，必须
     * @param RefererConfiguration.Status - 是否开启防盗链，枚举值：Enabled、Disabled
     * @param RefererConfiguration.RefererType - 防盗链类型，枚举值：Black-List、White-List，必须
     * @param RefererConfiguration.DomianList.Domain - 生效域名，必须
     * @param RefererConfiguration.EmptyReferConfiguration 是否允许空 Referer 访问，枚举值：Allow、Deny，默认值为 Deny，非必须
     * @param callback - 回调函数，必须
     * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                                  返回数据
     */
    putBucketReferer(
      params: {
        Bucket: string;
        Region: string;
        RefererConfiguration: {
          Status: 'Enabled' | 'Disabled';
          RefererType: 'Black-List' | 'White-List';
          DomainList: {
            Domains: string[]
          };
          EmptyReferConfiguration: 'Allow' | 'Deny';
        };
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取 Bucket 的防盗链白名单或者黑名单
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    getBucketReferer(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          RefererConfiguration: object
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 设置 Bucket 自定义域名
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                                  返回数据
     */
    putBucketDomain(
      params: {
        Bucket: string;
        Region: string;
        DomainRule: {
          Status: 'DISABLED' | 'ENABLED',
          Name: string,
          Type: 'REST' | 'WEBSITE'
        },
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    );

    /**
     * 获取 Bucket 的自定义域名
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    getBucketDomain(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          DomainRule: {
            Status: 'DISABLED' | 'ENABLED',
            Name: string,
            Type: 'REST' | 'WEBSITE'
          }[]
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 删除 Bucket 自定义域名
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    deleteBucketDomain(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 设置 Bucket 的回源
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                                  返回数据
     */
    putBucketOrigin(
      params: {
        Bucket: string;
        Region: string;
        OriginRule: object[],
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取 Bucket 的回源
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    getBucketOrigin(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          OriginRule: object[]
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 删除 Bucket 的回源
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    deleteBucketOrigin(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 设置 Bucket 的日志记录
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.BucketLoggingStatus - 说明日志记录配置的状态，如果无子节点信息则意为关闭日志记录，必须
     * @param callback - 回调函数，必须
     * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                                  返回数据
     */
    putBucketLogging(
      params: {
        Bucket: string;
        Region: string;
        BucketLoggingStatus: {
          LoggingEnabled?: {
            TargetBucket: string,
            TargetPrefix: string,
          }
        };
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取 Bucket 的日志记录
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    getBucketLogging(
      params: {
        Bucket: string;
        Region: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          BucketLoggingStatus: {
            LoggingEnabled?: {
              TargetBucket: string,
              TargetPrefix: string,
            }
          },
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 创建/编辑 Bucket 的清单任务
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Id - 清单任务的名称，必须
     * @param params.InventoryConfiguration - 包含清单的配置参数，必须
     * @param callback - 回调函数，必须
     * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                                  返回数据
     */
    putBucketInventory(
      params: {
        Bucket: string;
        Region: string;
        Id: string;
        InventoryConfiguration: object;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取 Bucket 的清单任务信息
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Id - 清单任务的名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    getBucketInventory(
      params: {
        Bucket: string;
        Region: string;
        Id: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          InventoryConfiguration: object
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 获取 Bucket 的清单任务信息
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.ContinuationToken - 当 COS 响应体中 IsTruncated 为 true，且 NextContinuationToken 节点中存在参数值时，您可以将这个参数作为 continuation-token 参数值，以获取下一页的清单任务信息，非必须
     * @param callback - 回调函数，必须
     * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                              返回数据
     */
    listBucketInventory(
      params: {
        Bucket: string;
        Region: string;
        ContinuationToken: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        ListInventoryConfigurationResult?: object
      ) => void
    ): void;

    /**
     * 删除 Bucket 的清单任务
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Id - 清单任务的名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    deleteBucketInventory(
      params: {
        Bucket: string;
        Region: string;
        Id: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 启用或者暂停存储桶的全球加速功能
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Id - 清单任务的名称，必须
     * @param params.InventoryConfiguration - 包含清单的配置参数，必须
     * @param callback - 回调函数，必须
     * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                                  返回数据
     */
    putBucketAccelerate(
      params: {
        Bucket: string;
        Region: string;
        AccelerateConfiguration: {
          Status: 'Enabled' | 'Suspended'
        };
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          statusCode: string;
          headers: string;
          AccelerateConfiguration: {
            Status: 'Enabled' | 'Suspended'
          };
        }
      ) => void
    ): void;

    /**
     * 查询存储桶的全球加速功能配置
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Id - 清单任务的名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回数据
     */
    getBucketAccelerate(
      params: {
        Bucket: string;
        Region: string;
        Id: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          InventoryConfiguration: {
            Status: 'Enabled' | 'Suspended'
          }
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 取回对应Object的元数据，Head的权限与Get的权限一致
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - 文件名称，必须
     * @param params.IfModifiedSince - 当Object在指定时间后被修改，则返回对应Object元信息，否则返回304，非必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
     * @returns data.NotModified         是否在 IfModifiedSince 时间点之后未修改该 object，则为 true
     */
    headObject(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          ETag: string;
          VersionId?: string;
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 下载 object
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - 文件名称，必须
     * @param params.Output - 文件写入流，非必须
     * @param params.IfModifiedSince - 当Object在指定时间后被修改，则返回对应Object元信息，否则返回304，非必须
     * @param params.IfUnmodifiedSince - 如果文件修改时间早于或等于指定时间，才返回文件内容。否则返回 412 (precondition failed)，非必须
     * @param params.IfMatch - 当 ETag 与指定的内容一致，才返回文件。否则返回 412 (precondition failed)，非必须
     * @param params.IfNoneMatch - 当 ETag 与指定的内容不一致，才返回文件。否则返回304 (not modified)，非必须
     * @param params.ResponseContentType - 设置返回头部中的 Content-Type 参数，非必须
     * @param params.ResponseContentLanguage - 设置返回头部中的 Content-Language 参数，非必须
     * @param params.ResponseExpires - 设置返回头部中的 Content-Expires 参数，非必须
     * @param params.ResponseCacheControl - 设置返回头部中的 Cache-Control 参数，非必须
     * @param params.ResponseContentDisposition - 设置返回头部中的 Content-Disposition 参数，非必须
     * @param params.ResponseContentEncoding - 设置返回头部中的 Content-Encoding 参数，非必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
     * @returns data - 为对应的 object 数据，包括 body 和 headers
     */
    getObject(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        Output?: File;
        IfModifiedSince?: string;
        IfUnmodifiedSince?: string;
        IfMatch?: string;
        IfNoneMatch?: string;
        ResponseContentType?: string;
        ResponseContentLanguage?: string;
        ResponseExpires?: string;
        ResponseCacheControl?: string;
        ResponseContentDisposition?: string;
        ResponseContentEncoding?: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Body: object
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 下载 object，返回 Stream 对象
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - 文件名称，必须
     * @param params.Output - 文件写入流，非必须
     * @param params.IfModifiedSince - 当Object在指定时间后被修改，则返回对应Object元信息，否则返回304，非必须
     * @param params.IfUnmodifiedSince - 如果文件修改时间早于或等于指定时间，才返回文件内容。否则返回 412 (precondition failed)，非必须
     * @param params.IfMatch - 当 ETag 与指定的内容一致，才返回文件。否则返回 412 (precondition failed)，非必须
     * @param params.IfNoneMatch - 当 ETag 与指定的内容不一致，才返回文件。否则返回304 (not modified)，非必须
     * @param params.ResponseContentType - 设置返回头部中的 Content-Type 参数，非必须
     * @param params.ResponseContentLanguage - 设置返回头部中的 Content-Language 参数，非必须
     * @param params.ResponseExpires - 设置返回头部中的 Content-Expires 参数，非必须
     * @param params.ResponseCacheControl - 设置返回头部中的 Cache-Control 参数，非必须
     * @param params.ResponseContentDisposition - 设置返回头部中的 Content-Disposition 参数，非必须
     * @param params.ResponseContentEncoding - 设置返回头部中的 Content-Encoding 参数，非必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
     * @returns data - 为对应的 object 数据，包括 body 和 headers
     */
    getObjectStream(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        Output?: File;
        IfModifiedSince?: string;
        IfUnmodifiedSince?: string;
        IfMatch?: string;
        IfNoneMatch?: string;
        ResponseContentType?: string;
        ResponseContentLanguage?: string;
        ResponseExpires?: string;
        ResponseCacheControl?: string;
        ResponseContentDisposition?: string;
        ResponseContentEncoding?: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Body: object,
        } & APIResCommonData
      ) => void
    ): Stream;

    /**
     * 上传 object
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - 文件名称，必须
     * @param params.Body - 传文件的内容，可以为 FileStream、字符串、Buffer，必须
     * @param params.CacheControl - RFC 2616 中定义的缓存策略，将作为 Object 元数据保存，非必须
     * @param params.ContentDisposition - RFC 2616 中定义的文件名称，将作为 Object 元数据保存，非必须
     * @param params.ContentEncoding - RFC 2616 中定义的编码格式，将作为 Object 元数据保存，非必须
     * @param params.ContentLength - RFC 2616 中定义的 HTTP 请求内容长度（字节），必须
     * @param params.ContentType - RFC 2616 中定义的内容类型（MIME），将作为 Object 元数据保存，非必须
     * @param params.Expires - RFC 2616 中定义的过期时间，将作为 Object 元数据保存，非必须
     * @param params.Expect - 当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容，非必须
     * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，非必须
     * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.StorageClass - 设置对象的存储级别，枚举值：STANDARD、STANDARD_IA、ARCHIVE，默认值：STANDARD，非必须
     * @param params.x-cos-meta-* - 允许用户自定义的头部信息，将作为对象的元数据保存。大小限制2KB，非必须
     * @param params.ContentSha1 - RFC 3174 中定义的 160-bit 内容 SHA-1 算法校验，非必须
     * @param params.ServerSideEncryption - 支持按照指定的加密算法进行服务端数据加密，格式 x-cos-server-side-encryption: "AES256"，非必须
     * @param params.onTaskReady - 任务准备完成之后，会把 taskId 通过这个回调返回
     * @param params.onProgress - 上传进度回调函数
     * @param callback - 回调函数，必须
     * @returns err                                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                          为对应的 object 数据
     * @returns data.ETag                                 为对应上传文件的 ETag 值
     * @returns data.Location                                 为对应上传文件不带 https:// 的 url 值，例如 testbucket-1250000000.cos.ap-beijing.myqcloud.com/folder/1.jpg
     */
    putObject(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        Body: Buffer | String | Stream;
        Query?: string,
        CacheControl?: string;
        ContentDisposition?: string;
        ContentEncoding?: string;
        ContentLength?: string;
        ContentType?: string;
        Expires?: string;
        Expect?: string;
        ACL?: string;
        GrantRead?: string;
        GrantReadAcp?: string;
        GrantWriteAcp?: string;
        GrantFullControl?: string;
        StorageClass?: string;
        'x-cos-meta-*'?: string;
        ContentSha1?: string;
        ServerSideEncryption?: string;
        onTaskReady?: Function;
        onProgress?: onProgress;
      } & ParamsCommon,
      callback: (err: APIResError, data?: {
        ETag: string,
        Location: string,
      } & APIResCommonData) => void
    ): void;

    /**
     * 删除 object
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param callback - 回调函数，必须
     * @returns err - 请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data - 删除操作成功之后返回的数据
     */
    deleteObject(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 批量删除 object
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Objects - 要删除的对象列表，必须
     * @param callback - 回调函数，必须
     * @returns err - 请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data - 删除操作成功之后返回的数据
     */
    deleteMultipleObject(
      params: {
        Bucket: string;
        Region: string;
        Objects: {
          Key: string,
          VersionId?: string
        }[]
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Deleted: {
            Key: string,
            VersionId?: string,
            DeleteMarker?: 'false' | 'true',
            DeleteMarkerVersionId?: string,
          }[],
          Error: {
            Key: string,
            VersionId?: string
          }[],
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 获取 object 的 权限列表
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param callback - 回调函数，必须
     * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                          返回的数据
     * @returns data.AccessControlPolicy  权限列表
     */
    getObjectAcl(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 设置 object 的 权限列表
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回的数据
     */
    putObjectAcl(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * Options Object请求实现跨域访问的预请求。即发出一个 OPTIONS 请求给服务器以确认是否可以进行跨域操作。
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回的数据
     */
    optionsObject(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          AccessControlAllowOrigin: string;
          AccessControlAllowMethods: string;
          AccessControlAllowHeaders: string;
          AccessControlExposeHeaders: string;
          AccessControlMaxAge: string
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 恢复归档对象
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.RestoreRequest - object 用于恢复数据的容器，必须
     * @param params.RestoreRequest.Days - object 设置临时副本的过期时间，必须
     * @param params.RestoreRequest.CASJobParameters.Tier - Standard（标准模式，恢复任务在3 - 5小时内完成），Expedited（极速模式，恢复任务在15分钟内可完成），Bulk（批量模式，恢复任务在5 - 12小时内完成），必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回的数据
     */
    restoreObject(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        RestoreRequest: {
          Days: number | string,
          CASJobParameters: {
            Tier: 'Expedited' | 'Standard' | 'Bulk'
          }
        },
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 检索对象内容
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.SelectType - 代表接口版本信息，当前固定传入 2，必须
     * @param params.SelectRequest - 查询参数对象，具体参数格式请看文档 https://cloud.tencent.com/document/product/436/37641
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回的数据
     */
    selectObjectContent(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        SelectType: number,
        SelectRequest: object,
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 检索对象内容，返回 Stream 对象
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.SelectType - 代表接口版本信息，当前固定传入 2，必须
     * @param params.SelectRequest - 查询参数对象，具体参数格式请看文档 https://cloud.tencent.com/document/product/436/37641
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回的数据
     */
    selectObjectContentStream(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        SelectType: number,
        SelectRequest: object,
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
        } & APIResCommonData
      ) => void
    ): Stream;

    /**
     * 复制对象
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket 名称
     * @param params.Region - 地域名称
     * @param params.Key - 文件名称
     * @param params.CopySource - 源文件URL绝对路径，可以通过versionid子资源指定历史版本
     * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，非必须
     * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
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
     * @param params.ServerSideEncryption - 支持按照指定的加密算法进行服务端数据加密，格式 x-cos-server-side-encryption: "AES256"，非必须
     * @param params['x-cos-meta-*'] - 允许用户自定义的头部信息，将作为 Object 元数据返回。大小限制2K。
     * @param callback - 回调函数，必须
     * @returns err                                       请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                      返回的数据
     */
    putObjectCopy(
      params: {
        Bucket: string
        Region: string,
        Key: string,
        CopySource: string,
        MetadataDirective?: 'Copy' | 'Replaced',
        ACL?: string,
        GrantRead?: string,
        GrantReadAcp?: string,
        GrantWriteAcp?: string,
        GrantFullControl?: string,
        CopySourceIfModifiedSince?: string,
        CopySourceIfUnmodifiedSince?: string,
        CopySourceIfMatch?: string,
        CopySourceIfNoneMatch?: string,
        StorageClass?: string,
        CacheControl?: string,
        ContentDisposition?: string,
        ContentEncoding?: string,
        ContentLength?: string,
        ContentType?: string,
        Expires?: string,
        Expect?: string,
        ContentLanguage?: string,
        'x-cos-meta-*'?: string
      },
      callback: (err: APIResError, data?: APIResCommonData) => void
    ) : void;

    /**
     * 设置对象标签
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.Tags - 要设置的标签列表，例如 [{Key: 'k1', Value: 'v1'}]，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回的数据
     */
    putObjectTagging(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        Tags: {
          Key: string;
          Value: string;
        }[],
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 查询对象标签
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回的数据
     * @returns data.Tags         返回的标签列表 [{Key: 'k1', Value: 'v1'}]
     */
    getObjectTagging(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          Tags: {
            Key: string;
            Value: string;
          }[]
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 删除对象标签
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param callback - 回调函数，必须
     * @returns err               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data              返回的数据
     */
    deleteObjectTagging(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

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
     * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，非必须
     * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.StorageClass	设置对象的存储级别，枚举值：STANDARD、STANDARD_IA、ARCHIVE，默认值：STANDARD	String	否
     * @param params['x-cos-meta-*']	允许用户自定义的头部信息，将作为对象的元数据返回。大小限制2KB	String	否
     * @param callback - 回调函数，必须
     * @returns err                                       请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                      返回的数据
     */
    multipartInit(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        CacheControl?: string,
        ContentDisposition?: string,
        ContentEncoding?: string,
        ContentType?: string,
        Expires?: string,
        ACL?: string,
        GrantRead?: string,
        GrantReadAcp?: string,
        GrantWriteAcp?: string,
        GrantFullControl?: string,
        StorageClass?: string,
      } & ParamsCommon,
      callback: (err: APIResError, data?: {
        UploadId: string,
      } & APIResCommonData) => void
    ): void;

    /**
     * 分块上传
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.ContentLength - RFC 2616 中定义的 HTTP 请求内容长度（字节），非必须
     * @param params.Expect - 当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容，非必须
     * @param params.ServerSideEncryption - 支持按照指定的加密算法进行服务端数据加密，格式 x-cos-server-side-encryption: "AES256"，非必须
     * @param params.ContentSha1 - RFC 3174 中定义的 160-bit 内容 SHA-1 算法校验值，非必须
     * @param callback - 回调函数，必须
     * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                              返回的数据
     * @returns data.ETag                         返回的文件分块 sha1 值
     */
    multipartUpload(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        Body: Buffer | String | Stream;
        ContentLength?: string;
        Expect?: string;
        ServerSideEncryption?: string;
        ContentSha1?: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          ETag: string
        } & APIResCommonData
      ) => void
    ): void;

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
     * @param callback - 回调函数，必须
     * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                              返回的数据
     * @returns data.ETag                         返回的文件分块 sha1 值
     */
    uploadPartCopy(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        CopySource: string;
        UploadId: string;
        PartNumber: string;
        CopySourceRange?: string;
        CopySourceIfMatch?: string;
        CopySourceIfNoneMatch?: string;
        CopySourceIfUnmodifiedSince?: string;
        CopySourceIfModifiedSince?: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          ETag: string
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 完成分块上传
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.Parts - 分块信息列表，必须
     * @param params.Parts[i].PartNumber - 块编号，必须
     * @param params.Parts[i].ETag - 分块的 sha1 校验值
     * @param callback - 回调函数，必须
     * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                              返回的数据
     * @returns data.CompleteMultipartUpload  完成分块上传后的文件信息，包括Location, Bucket, Key 和 ETag
     */
    multipartComplete(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        Parts: object;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 分块上传任务列表查询
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Delimiter - 定界符为一个符号，如果有Prefix，则将Prefix到delimiter之间的相同路径归为一类，定义为Common Prefix，然后列出所有Common Prefix。如果没有Prefix，则从路径起点开始，非必须
     * @param params.EncodingType - 规定返回值的编码方式，非必须
     * @param params.Prefix - 前缀匹配，用来规定返回的文件前缀地址，非必须
     * @param params.MaxUploads - 单次返回最大的条目数量，默认1000，非必须
     * @param params.KeyMarker - 与upload-id-marker一起使用 </Br>当upload-id-marker未被指定时，ObjectName字母顺序大于key-marker的条目将被列出 </Br>当upload-id-marker被指定时，ObjectName字母顺序大于key-marker的条目被列出，ObjectName字母顺序等于key-marker同时UploadId大于upload-id-marker的条目将被列出，非必须
     * @param params.UploadIdMarker - 与key-marker一起使用 </Br>当key-marker未被指定时，upload-id-marker将被忽略 </Br>当key-marker被指定时，ObjectName字母顺序大于key-marker的条目被列出，ObjectName字母顺序等于key-marker同时UploadId大于upload-id-marker的条目将被列出，非必须
     * @param callback - 回调函数，必须
     * @returns err                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                  返回的数据
     * @returns data.ListMultipartUploadsResult   分块上传任务信息
     */
    multipartList(
      params: {
        Bucket: string;
        Region: string;
        Prefix: string;
        Delimiter?: '/' | string;
        EncodingType?: string;
        MaxUploads?: string;
        KeyMarker?: string;
        UploadIdMarker?: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 上传的分块列表查询
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.UploadId - 标示本次分块上传的ID，必须
     * @param params.EncodingType - 规定返回值的编码方式，非必须
     * @param params.MaxParts - 单次返回最大的条目数量，默认1000，非必须
     * @param params.PartNumberMarker - 默认以UTF-8二进制顺序列出条目，所有列出条目从marker开始，非必须
     * @param callback - 回调函数，必须
     * @returns err                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data                                  返回的数据
     * @returns data.ListMultipartUploadsResult   分块信息
     */
    multipartListPart(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        UploadId: string;
        EncodingType?: string;
        MaxParts?: string;
        PartNumberMarker?: string;
      } & ParamsCommon,
      callback: (
        err: APIResError,
        data?: {
          ListMultipartUploadsResult: object
        } & APIResCommonData
      ) => void
    ): void;

    /**
     * 抛弃分块上传
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.UploadId - 标示本次分块上传的ID，必须
     * @param callback - 回调函数，必须
     * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data            返回的数据
     */
    multipartAbort(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        UploadId: string;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

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
     * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，非必须
     * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
     * @param params.StorageClass	设置对象的存储级别，枚举值：STANDARD、STANDARD_IA、ARCHIVE，默认值：STANDARD	String	否
     * @param params['x-cos-meta-*']	允许用户自定义的头部信息，将作为对象的元数据保存，大小限制2KB	String	否
     * @param params.onTaskReady	上传任务创建时的回调函数，返回一个 taskId，唯一标识上传任务，可用于上传任务的取消（cancelTask），停止（pauseTask）和重新开始（restartTask）	Function	否
     * @param params.onProgress	进度的回调函数，进度回调响应对象（progressData）属性如下	Function	否
     * @param callback - 回调函数，必须
     * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data            返回的数据
     */
    sliceUploadFile(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        FilePath: string;
        Query?: string,
        Headers?: string,
        CacheControl?: string,
        ContentDisposition?: string,
        ContentEncoding?: string,
        ContentLength?: string,
        ContentType?: string,
        Expires?: string,
        Expect?: string,
        ACL?: string,
        GrantRead?: string,
        GrantReadAcp?: string,
        GrantWriteAcp?: string,
        GrantFullControl?: string,
        StorageClass?: string,
        'x-cos-meta-*'?: string,
        onTaskReady?: Function,
        onHashProgress?: onProgress,
        onProgress?: onProgress;
      } & ParamsCommon,
      callback: (err: APIResError, UploadCompleteData?: object) => void
    ): void;

    /**
     * 分片上传文件，封装好分片上传的多个步骤的上传方法。
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.Level - 清理任务的级别，枚举值 task（只清理单个 UploadId）、file（列出指定对象的所有 UploadId 并清理）、bucket（列出存储桶的所有 UploadId 并清理）'，可选
     * @param params.UploadId - 当 Level 传 task 时，必需传入 UploadId
     * @param callback - 回调函数，必须
     * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data            返回的数据
     */
    abortUploadTask(
      params: {
        Bucket: string,
        Region: string,
        Key: string,
        Level?: 'task' | 'file' | 'bucket',
        UploadId?: string,
      },
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 分片复制文件
     * @param params - 参数对象，必须
     * @param params.Bucket - Bucket名称，必须
     * @param params.Region - 地域名称，必须
     * @param params.Key - object名称，必须
     * @param params.FilePath - 请求的方法，可选
     * @param params.onProgress - 签名超时时间，单位秒，可选
     * @param params.onFileFinish - 请求头部，可选
     * @returns taskList  返回上传任务列表
     */
    uploadFiles(
      params: ({
        Bucket: string;
        Region: string;
        Key: string;
        FilePath: string;
        onProgress?: Function;
        onFileFinish?: (err: APIResError, data?: object) => void;
      } & ParamsCommon)[],
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 分片复制文件
     * @returns taskList  返回上传任务列表
     */
    sliceCopyFile(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        CopySource: string;
        CopySliceSize?: number;
        CopyChunkSize?: number;
      } & ParamsCommon,
      callback: (err: APIResError, data?: APIResCommonData) => void
    ): void;

    /**
     * 获取上传任务列表
     * @returns taskList  返回上传任务列表
     */
    getTaskList(): {
      id: number;
      Bucket: string;
      Region: string;
      Key: string;
      FilePath: string;
      state: string;
      error: string;
      loaded: number;
      size: number;
      speed: number;
      percent: number;
      hashPercent: number;
    }[];

    /**
     * 判断上传队列是否有未完成的任务
     * @param taskId - 上传队列的任务 id，必须
     */
    pauseTask(taskId: number): void;

    /**
     * 判断上传队列是否有未完成的任务
     * @param taskId - 上传队列的任务 id，必须
     */
    restartTask(taskId: number): void;

    /**
     * 判断上传队列是否有未完成的任务
     * @param taskId - 上传队列的任务 id，必须
     */
    cancelTask(taskId: number): void;

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
     * @param callback - 回调函数，必须
     * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
     * @returns data            返回的数据
     */
    getObjectUrl(
      params: {
        Bucket: string;
        Region: string;
        Key: string;
        Method: string;
        Sign?: boolean;
        Expires?: number;
        Headers?: Headers,
        Query?: Query,
      },
      callback: (
        err: APIResError,
        data?: {
          Url: string;
        }
      ) => void
    ): string;

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
    getV4Auth(params: {
      Bucket?: string,
      Key?: string,
      Expires?: number,
      SecretId?: string,
      SecretKey?: string,
    }): string;

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
    getAuth(params: {
      Method?: string,
      Key?: string,
      Expires?: number,
      Query?: Query,
      Headers?: Headers,
      SecretId?: string,
      SecretKey?: string,
    }): string;

  }

}

export = COS;
