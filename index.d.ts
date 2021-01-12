/**
 * COS 语言
 * 参考模版
 * https://www.tslang.cn/docs/handbook/declaration-files/templates/module-class-d-ts.html
 */
import { Stream } from 'stream';

declare namespace COS {

  // 外部类型
  // API 相关
  type Bucket = string;
  type Region = string;
  type Key = string;
  type Pathname = string;
  type VersionId = string;
  type Prefix = string;
  type UploadId = string;
  type Delimiter = '/' | string;
  type EncodingType = 'url' | string;
  type StorageClass = 'STANDARD' | 'STANDARD_IA' | 'ARCHIVE' | 'DEEP_ARCHIVE' | 'INTELLIGENT_TIERING' | 'MAZ_STANDARD' | 'MAZ_STANDARD_IA' | 'MAZ_INTELLIGENT_TIERING';
  type BooleanString = 'true' | 'false';
  type Location = string;
  type IsoDateTime = string;
  type UploadBody = Buffer | String | Stream;
  type GetObjectBody = Buffer | String | Stream;
  type BodyType = 'text' | 'blob' | 'arraybuffer';
  type Query = object;
  type Headers = object;
  type Method = 'GET' | 'DELETE' | 'POST' | 'PUT' | 'OPTIONS' | 'get' | 'delete' | 'post' | 'put' | 'options';
  type Scope = { action: string, bucket: Bucket, region: Region, prefix: Prefix }[];
  type BucketACL = 'private' | 'public-read' | 'public-read-write';
  type ObjectACL = 'default' | 'private' | 'public-read';
  type Permission = 'READ' | 'WRITE' | 'READ_ACP' | 'WRITE_ACP' | 'FULL_CONTROL';
  type Owner = { ID: string, DisplayName: string };
  type Initiator = Owner;
  type Grant = string;
  interface ProgressInfo {
    loaded: number,
    total: number,
    speed: number,
    percent: number,
  }
  interface Grants {
    Grantee: Owner,
    Permission: Permission,
  }
  interface Tag {
    Key: Key,
    Value: string,
  }
  interface Part {
    PartNumber: string,
    ETag: string,
  }
  type onProgress = (params: ProgressInfo) => any;

  // 实例参数
  interface COSOptions {
    SecretId?: string,
    SecretKey?: string,
    XCosSecurityToken?: string,
    ChunkRetryTimes?: number,
    FileParallelLimit?: number,
    ChunkParallelLimit?: number,
    ChunkSize?: number,
    SliceSize?: number,
    CopyChunkParallelLimit?: number,
    CopyChunkSize?: number,
    CopySliceSize?: number,
    MaxPartNumber?: number,
    ProgressInterval?: number,
    UploadQueueSize?: number,
    Domain?: string,
    ServiceDomain?: string,
    Protocol?: string,
    CompatibilityMode?: boolean,
    ForcePathStyle?: boolean,
    UseRawKey?: boolean,
    Timeout?: number, // Unit: ms
    CorrectClockSkew?: boolean,
    SystemClockOffset?: number, // Unit: ms
    UploadCheckContentMd5?: boolean,
    UploadAddMetaMd5?: boolean,
    UploadIdCacheLimit?: number,
    ConfCwd?: string,
    /**
     * 获取临时密钥
     */
    getAuthorization?: (
        options: GetAuthorizationOptions,
        callback: (
            params: GetAuthorizationCallbackParams
        ) => void
    ) => void,
  }

  interface StaticGetAuthorizationOptions {
    SecretId: string,
    SecretKey: string,
    Method?: Method,
    Pathname?: Pathname,
    Query?: Query,
    Headers?: Headers,
    SystemClockOffset?: number,
  }
  interface GetAuthorizationOptions {
    Bucket: Bucket,
    Region: Region,
    Method: Method,
    Key: Key,
    Pathname: Pathname,
    Query: Query,
    Headers: Headers,
    Scope: Scope,
    SystemClockOffset: number,
  }
  interface Credentials {
    TmpSecretId: string,
    TmpSecretKey: string,
    XCosSecurityToken: string,
    StartTime: number,
    ExpiredTime: number,
    ScopeLimit?: boolean,
  }
  type Authorization = string;
  type GetAuthorizationCallbackParams = Authorization | Credentials;

  // 所有接口的入参和出参
  type Error = null | {
    statusCode?: number,
    headers?: Headers,
    error: string | Error | { Code: string, Message: string }
  }
  interface GeneralResult {
    statusCode?: number,
    headers?: Headers,
  }
  interface GeneralParams {
    Headers?: Headers,
  }
  interface GeneralBucketParams extends GeneralParams {
    Bucket: Bucket,
    Region: Region,
  }
  interface GeneralObjectParams extends GeneralBucketParams {
    Key: Key,
  }

  // getService
  interface GetServiceParams extends GeneralParams {}
  interface GetServiceResult extends GeneralResult {
    Buckets: {
      Name: Bucket,
      Location: Location,
      CreationDate: IsoDateTime,
    }[],
    Owner: Owner,
  }

  // putBucket
  interface PutBucketParams extends GeneralBucketParams {
    ACL?: BucketACL,
    GrantRead?: Grant,
    GrantWrite?: Grant,
    GrantReadAcp?: Grant,
    GrantWriteAcp?: Grant,
    GrantFullControl?: Grant,
    BucketAZConfig?: 'MAZ' | string,
  }
  interface PutBucketResult extends GeneralResult {
    Location: string
  }

  // headBucket
  interface HeadBucketParams extends GeneralBucketParams {}
  interface HeadBucketResult extends GeneralResult {}

  // getBucket
  interface GetBucketParams extends GeneralBucketParams {
    Prefix: Prefix,
    Delimiter?: Delimiter,
    Marker?: Key,
    MaxKeys?: number,
    EncodingType?: EncodingType,
  }
  interface Object {
    Key: Key,
    LastModified: IsoDateTime,
    ETag: string,
    Size: string,
    StorageClass: StorageClass,
    StorageTier?: string,
    Owner: Owner,
  }
  interface GetBucketResult extends GeneralResult {
    Contents: Object[]
    CommonPrefixes: {
      Prefix: Prefix,
    }[],
    IsTruncated: BooleanString,
    NextMarker?: string,
  }

  // listObjectVersions
  interface ListObjectVersionsParams extends GeneralBucketParams {
    Prefix: Prefix,
    Delimiter?: Delimiter,
    Marker?: string,
    MaxKeys?: string,
    VersionIdMarker?: string,
    EncodingType?: EncodingType,
  }
  interface DeleteMarker {
    Key: Key,
    VersionId: VersionId,
    IsLatest: string,
    LastModified: IsoDateTime,
    Owner: Owner,
  }
  interface ObjectVersion {
    Key: Key,
    VersionId: VersionId,
    IsLatest: BooleanString,
    LastModified: IsoDateTime,
    ETag: string,
    Size: string,
    Owner: Owner,
    StorageClass: StorageClass,
    StorageTier?: string,
  }
  interface ListObjectVersionsResult extends GeneralResult {
    CommonPrefixes: {
      Prefix: Prefix,
    }[],
    DeleteMarkers: DeleteMarker[],
    Versions: ObjectVersion[],
    IsTruncated: BooleanString,
    NextMarker?: string,
    NextVersionIdMarker?: string,
  }

  // deleteBucket
  interface DeleteBucketParams extends GeneralBucketParams {}
  interface DeleteBucketResult extends GeneralResult {}

  // putBucketAcl
  interface PutBucketAclParams extends GeneralBucketParams {
    ACL?: BucketACL,
    GrantRead?: Grant,
    GrantWrite: Grant,
    GrantReadAcp?: Grant,
    GrantWriteAcp?: Grant,
    GrantFullControl?: Grant,
  }
  interface PutBucketAclResult extends GeneralResult {}

  // getBucketAcl
  interface GetBucketAclParams extends GeneralBucketParams {}
  interface GetBucketAclResult extends GeneralResult {
    ACL: BucketACL,
    GrantRead: Grant,
    GrantWrite: Grant,
    GrantReadAcp: Grant,
    GrantWriteAcp: Grant,
    GrantFullControl: Grant,
    Owner: Owner,
    Grants: Grants
  }

  // putBucketCors
  type CORSRule = {
    AllowedOrigin: string[],
    AllowedMethod: string[],
    AllowedHeader?: string[],
    ExposeHeader?: string[],
    MaxAgeSeconds?: number,
  };
  interface PutBucketCorsParams extends GeneralBucketParams {
    CORSRules: CORSRule[]
    Headers: Headers
  }
  interface PutBucketCorsResult extends GeneralResult {
    CORSRules: object,
  }

  // getBucketCors
  interface GetBucketCorsParams extends GeneralBucketParams {}
  interface GetBucketCorsResult extends GeneralResult {}

  // deleteBucketCors
  interface DeleteBucketCorsParams extends GeneralBucketParams {}
  interface DeleteBucketCorsResult extends GeneralResult {}

  // getBucketLocation
  interface GetBucketLocationResult {
    LocationConstraint: Region,
  }
  interface GetBucketLocationParams extends GeneralBucketParams {}

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
  interface PutBucketPolicyParams extends GeneralBucketParams {
    Policy: Policy,
  }
  interface PutBucketPolicyResult extends GeneralResult {}

  // getBucketPolicy
  interface GetBucketPolicyParams extends GeneralBucketParams {}
  interface GetBucketPolicyResult extends GeneralResult {
    Policy: Policy
  }

  // deleteBucketPolicy
  interface DeleteBucketPolicyParams extends GeneralBucketParams {}
  interface DeleteBucketPolicyResult extends GeneralResult {}

  // putBucketTagging
  interface PutBucketTaggingParams extends GeneralBucketParams {
    Tags: Tag[],
  }
  interface PutBucketTaggingResult extends GeneralResult {}

  // getBucketTagging
  interface GetBucketTaggingResult extends GeneralResult {
    Tags: Tag[]
  }

  // deleteBucketTagging
  interface DeleteBucketTaggingParams extends GeneralBucketParams {}
  interface DeleteBucketTaggingResult extends GeneralResult {}

  // putBucketLifecycle
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
  interface PutBucketLifecycleParams extends GeneralBucketParams {
    Rules: LifecycleRule[],
  }
  interface PutBucketLifecycleResult extends GeneralResult {}

  // getBucketLifecycle
  interface GetBucketLifecycleParams extends GeneralBucketParams {}
  interface GetBucketLifecycleResult extends GeneralResult {
    Rules: LifecycleRule[]
  }

  // deleteBucketLifecycle
  interface DeleteBucketLifecycleParams extends GeneralBucketParams {}
  interface DeleteBucketLifecycleResult extends GeneralResult {}

  // putBucketVersioning
  interface VersioningConfiguration {
    Status: 'Enabled' | 'Suspended',
  }
  interface PutBucketVersioningParams extends GeneralBucketParams {
    VersioningConfiguration,
  }
  interface PutBucketVersioningResult extends GeneralResult {}

  // getBucketVersioning
  interface GetBucketVersioningParams extends GeneralBucketParams {}
  interface GetBucketVersioningResult extends GeneralResult {
    VersioningConfiguration,
  }

  // putBucketReplication
  interface ReplicationRule {
    ID?: string,
    Status: 'Enabled' | 'Disabled',
    Prefix: Prefix,
    Destination: {
      Bucket: Bucket,
      StorageClass?: StorageClass,
    }
  }
  interface ReplicationConfiguration {
    Role: string,
    Rules: ReplicationRule[]
  }
  interface PutBucketReplicationParams extends GeneralBucketParams {
    ReplicationConfiguration,
  }
  interface PutBucketReplicationResult extends GeneralResult {}

  // getBucketReplication
  interface GetBucketReplicationParams extends GeneralBucketParams {}
  interface GetBucketReplicationResult extends GeneralResult {
    ReplicationConfiguration
  }

  // deleteBucketReplication
  interface DeleteBucketReplicationParams extends GeneralBucketParams {}
  interface DeleteBucketReplicationResult extends GeneralResult {}

  // putBucketWebsite
  interface WebsiteConfiguration {
    IndexDocument: {
      Suffix: string,
    },
    RedirectAllRequestsTo?: {
      Protocol: "https" | string
    },
    AutoAddressing?: {
      Status: 'Disabled' | 'Enabled'
    },
    ErrorDocument?: {
      Key: Key,
      OriginalHttpStatus?: string
    },
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
    }[],
  }
  interface PutBucketWebsiteParams extends GeneralBucketParams {
    WebsiteConfiguration: WebsiteConfiguration,
  }
  interface PutBucketWebsiteResult extends GeneralResult {}

  // getBucketWebsite
  interface GetBucketWebsiteParams extends GeneralBucketParams {}
  interface GetBucketWebsiteResult extends GeneralResult {
    WebsiteConfiguration: WebsiteConfiguration
  }

  // deleteBucketWebsite
  interface DeleteBucketWebsiteParams extends GeneralBucketParams {}
  interface DeleteBucketWebsiteResult extends GeneralResult {}

  // putBucketReferer
  interface RefererConfiguration {
    Status: 'Enabled' | 'Disabled',
    RefererType: 'Black-List' | 'White-List',
    DomainList: {
      Domains: string[]
    },
    EmptyReferConfiguration?: 'Allow' | 'Deny',
  }
  interface PutBucketRefererParams extends GeneralBucketParams {
    RefererConfiguration: RefererConfiguration,
  }
  interface PutBucketRefererResult extends GeneralResult {}

  // getBucketReferer
  interface GetBucketRefererParams extends GeneralBucketParams {}
  interface GetBucketRefererResult extends GeneralResult {
    RefererConfiguration: RefererConfiguration,
  }

  // putBucketDomain
  interface PutBucketDomainParams extends GeneralBucketParams {
    DomainRule: {
      Status: 'DISABLED' | 'ENABLED',
      Name: string,
      Type: 'REST' | 'WEBSITE'
    },
  }
  interface PutBucketDomainResult extends GeneralResult {}

  // getBucketDomain
  interface DomainRule {
    Status: 'DISABLED' | 'ENABLED',
    Name: string,
    Type: 'REST' | 'WEBSITE'
  }
  interface GetBucketDomainParams extends GeneralBucketParams {}
  interface GetBucketDomainResult extends GeneralResult {
    DomainRule: DomainRule[]
  }

  // deleteBucketDomain
  interface DeleteBucketDomainParams extends GeneralBucketParams {}
  interface DeleteBucketDomainResult extends GeneralResult {}

  // putBucketOrigin
  interface PutBucketOriginParams extends GeneralBucketParams {
    OriginRule: DomainRule[],
  }
  interface PutBucketOriginResult extends GeneralResult {}

  // getBucketOrigin
  interface GetBucketOriginParams extends GeneralBucketParams {}
  interface GetBucketOriginResult extends GeneralResult {
    OriginRule: object[],
  }

  // deleteBucketOrigin
  interface DeleteBucketOriginParams extends GeneralBucketParams {}
  interface DeleteBucketOriginResult extends GeneralResult {}

  // putBucketLogging
  interface PutBucketLoggingParams extends GeneralBucketParams {
    BucketLoggingStatus: {
      LoggingEnabled?: {
        TargetBucket: Bucket,
        TargetPrefix: Prefix,
      }
    },
  }
  interface PutBucketLoggingResult extends GeneralResult {}

  // getBucketLogging
  interface GetBucketLoggingParams extends GeneralBucketParams {}
  interface GetBucketLoggingResult extends GeneralResult {
    BucketLoggingStatus: {
      LoggingEnabled?: {
        TargetBucket: Bucket,
        TargetPrefix: Prefix,
      }
    },
  }

  // putBucketInventory
  interface PutBucketInventoryParams extends GeneralBucketParams {
    Id: string,
    InventoryConfiguration: object,
  }
  interface PutBucketInventoryResult extends GeneralResult {}

  // getBucketInventory
  interface GetBucketInventoryParams extends GeneralBucketParams {
    Id: string,
  }
  interface GetBucketInventoryResult extends GeneralResult {
    InventoryConfiguration: object
  }

  // listBucketInventory
  interface ListBucketInventoryParams extends GeneralBucketParams {}
  interface ListBucketInventoryResult extends GeneralResult {
    ContinuationToken: string,
    InventoryConfigurations: object,
    IsTruncated: BooleanString,
  }

  // deleteBucketInventory
  interface DeleteBucketInventoryParams extends GeneralBucketParams {
    Id: string,
  }
  interface DeleteBucketInventoryResult extends GeneralResult {}

  // putBucketAccelerate
  interface PutBucketAccelerateParams extends GeneralBucketParams {
    AccelerateConfiguration: {
      Status: 'Enabled' | 'Suspended'
    },
  }
  interface PutBucketAccelerateResult extends GeneralResult {}

  // getBucketAccelerate
  interface GetBucketAccelerateParams extends GeneralBucketParams {
    Id: string,
  }
  interface GetBucketAccelerateResult extends GeneralResult {
    InventoryConfiguration: {
      Status: 'Enabled' | 'Suspended',
      Type: 'COS' | string,
    }
  }

  // headObject
  interface HeadObjectParams extends GeneralObjectParams {}
  interface HeadObjectResult extends GeneralResult {
    ETag: string,
    VersionId?: string,
  }

  // getObject
  // getObjectStream
  interface GetObjectParams extends GeneralObjectParams {
    BodyType?: BodyType,
    Output?: Stream,
    Query?: Query,
    IfModifiedSince?: string,
    IfUnmodifiedSince?: string,
    IfMatch?: string,
    IfNoneMatch?: string,
    ResponseContentType?: string,
    ResponseContentLanguage?: string,
    ResponseExpires?: string,
    ResponseCacheControl?: string,
    ResponseContentDisposition?: string,
    ResponseContentEncoding?: string,
  }
  interface GetObjectResult extends GeneralResult {
    Body: GetObjectBody,
    ETag: string,
    VersionId?: string,
  }

  // putObject
  interface PutObjectParams extends GeneralObjectParams {
    Body: UploadBody,
    Query?: string,
    CacheControl?: string,
    ContentDisposition?: string,
    ContentEncoding?: string,
    ContentLength?: number,
    ContentType?: string,
    Expires?: string,
    Expect?: string,
    ACL?: ObjectACL,
    GrantRead?: Grant,
    GrantReadAcp?: Grant,
    GrantWriteAcp?: Grant,
    GrantFullControl?: Grant,
    StorageClass?: StorageClass,
    'x-cos-meta-*'?: string,
    ContentSha1?: string,
    ServerSideEncryption?: string,
    onTaskReady?: Function,
    onProgress?: onProgress,
  }
  interface PutObjectResult extends GeneralResult {
    ETag: string,
    Location: string,
    VersionId?: VersionId,
  }

  // deleteObject
  interface DeleteObjectParams extends GeneralObjectParams {}
  interface DeleteObjectResult extends GeneralResult {}

  // deleteMultipleObject
  interface DeleteMultipleObjectParams extends GeneralObjectParams {
    Objects: {
      Key: Key,
      VersionId?: string
    }[]
  }
  interface DeleteMultipleObjectResult extends GeneralResult {
    Deleted: {
      Key: Key,
      VersionId?: VersionId,
      DeleteMarker?: DeleteMarker,
      DeleteMarkerVersionId?: VersionId,
    }[],
    Error: {
      Key: Key,
      VersionId?: string
    }[],
  }

  // getObjectAcl
  interface GetObjectAclParams extends GeneralObjectParams {}
  interface GetObjectAclResult extends GeneralResult {
    ACL: ObjectACL,
    GrantRead: Grant,
    GrantReadAcp: Grant,
    GrantWriteAcp: Grant,
    GrantFullControl: Grant,
    Owner: Owner,
    Grants: Grants,
  }

  // putObjectAcl
  interface PutObjectAclParams extends GeneralObjectParams {
    ACL?: ObjectACL,
    GrantRead?: Grant,
    GrantReadAcp?: Grant,
    GrantWriteAcp?: Grant,
    GrantFullControl?: Grant,
  }
  interface PutObjectAclResult extends GeneralResult {}

  // optionsObject
  interface OptionsObjectParams extends GeneralObjectParams {
    AccessControlRequestMethod: Method,
    AccessControlRequestHeaders: string,
  }
  interface OptionsObjectResult extends GeneralResult {
    AccessControlAllowOrigin: string,
    AccessControlAllowMethods: string,
    AccessControlAllowHeaders: string,
    AccessControlExposeHeaders: string,
    AccessControlMaxAge: string
  }

  // restoreObject
  interface RestoreRequest {
    Days: number | string,
    CASJobParameters: {
      Tier: 'Expedited' | 'Standard' | 'Bulk'
    }
  }
  interface RestoreObjectParams extends GeneralObjectParams {
    RestoreRequest: RestoreRequest,
  }
  interface RestoreObjectResult extends GeneralResult {}

  // selectObjectContent
  // selectObjectContentStream
  interface SelectObjectContentParams extends GeneralObjectParams {
    SelectType: number,
    SelectRequest: object,
  }
  interface SelectObjectContentResult extends GeneralResult {
    Stats: {
      BytesScanned: number,
      BytesProcessed: number,
      BytesReturned: number,
    },
    Payload?: Buffer,
  }

  // putObjectCopy
  interface PutObjectCopyParams extends GeneralObjectParams {
    CopySource: string,
    MetadataDirective?: 'Copy' | 'Replaced',
    ACL?: ObjectACL,
    GrantRead?: Grant,
    GrantReadAcp?: Grant,
    GrantWriteAcp?: Grant,
    GrantFullControl?: Grant,
    CopySourceIfModifiedSince?: string,
    CopySourceIfUnmodifiedSince?: string,
    CopySourceIfMatch?: string,
    CopySourceIfNoneMatch?: string,
    StorageClass?: StorageClass,
    CacheControl?: string,
    ContentDisposition?: string,
    ContentEncoding?: string,
    ContentLength?: number,
    ContentType?: string,
    Expires?: string,
    Expect?: string,
    ContentLanguage?: string,
    'x-cos-meta-*'?: string
  }
  interface PutObjectCopyResult extends GeneralResult {}

  // putObjectTagging
  interface PutObjectTaggingParams extends GeneralObjectParams {
    Tags: Tag[],
  }
  interface PutObjectTaggingResult extends GeneralResult {}

  // getObjectTagging
  interface GetObjectTaggingParams extends GeneralObjectParams {}
  interface GetObjectTaggingResult extends GeneralResult {
    Tags: Tag[],
  }

  // deleteObjectTagging
  interface DeleteObjectTaggingParams extends GeneralObjectParams {}
  interface DeleteObjectTaggingResult extends GeneralResult {}

  // multipartInit
  interface MultipartInitParams extends GeneralObjectParams {
    CacheControl?: string,
    ContentDisposition?: string,
    ContentEncoding?: string,
    ContentType?: string,
    Expires?: string,
    ACL?: ObjectACL,
    GrantRead?: Grant,
    GrantReadAcp?: Grant,
    GrantWriteAcp?: Grant,
    GrantFullControl?: Grant,
    Query?: Query,
    StorageClass?: StorageClass,
    'x-cos-meta-*'?: string,
  }
  interface MultipartInitResult extends GeneralResult {
    UploadId: string,
  }

  // multipartUpload
  interface MultipartUploadParams extends GeneralObjectParams {
    Body: UploadBody,
    ContentLength?: number,
    Expect?: string,
    ServerSideEncryption?: string,
    ContentSha1?: string,
  }
  interface MultipartUploadResult extends GeneralResult {
    ETag: string
  }

  // uploadPartCopy
  interface UploadPartCopyParams extends GeneralObjectParams {
    CopySource: string,
    UploadId: string,
    PartNumber: string,
    CopySourceRange?: string,
    CopySourceIfMatch?: string,
    CopySourceIfNoneMatch?: string,
    CopySourceIfUnmodifiedSince?: string,
    CopySourceIfModifiedSince?: string,
  }
  interface UploadPartCopyResult extends GeneralResult {
    ETag: string
  }

  // multipartComplete
  interface MultipartCompleteParams extends GeneralObjectParams {
    UploadId: UploadId,
    Parts: Part[],
  }
  interface MultipartCompleteResult extends GeneralResult {
    ETag: string,
    Location: string,
    VersionId?: VersionId,
  }

  // multipartList
  interface MultipartListParams extends GeneralBucketParams {
    Prefix: Prefix,
    MaxUploads?: number,
    KeyMarker?: Key,
    UploadIdMarker?: UploadId,
    EncodingType?: EncodingType,
  }
  interface MultipartListResult extends GeneralResult {
    Upload: {
      Key: Key,
      UploadId: UploadId,
      Initiator: Initiator,
      Owner: Owner,
      StorageClass: StorageClass,
      Initiated: IsoDateTime
    }[],
    IsTruncated: BooleanString,
    NextKeyMarker: Key,
    NextUploadIdMarker: UploadId,
  }

  // multipartListPart
  interface MultipartListPartParams extends GeneralObjectParams {
    Key: Key,
    UploadId: UploadId,
    MaxParts?: string,
    PartNumberMarker?: string,
    EncodingType?: EncodingType,
  }
  interface MultipartListPartResult extends GeneralResult {
    Part: {
      PartNumber: number,
      LastModified: IsoDateTime,
      ETag: string,
      Size: number,
    }[],
    Owner: Owner,
    Initiator: Initiator
    NextPartNumberMarker: number,
    StorageClass: StorageClass,
    IsTruncated: BooleanString,
  }

  // multipartAbort
  interface MultipartAbortParams extends GeneralObjectParams {
    UploadId: string,
  }
  interface MultipartAbortResult extends GeneralResult {}

  // sliceUploadFile
  interface SliceUploadFileParams extends GeneralObjectParams {
    FilePath: string,
    CacheControl?: string,
    ContentDisposition?: string,
    ContentEncoding?: string,
    ContentLength?: number,
    ContentType?: string,
    Expires?: string,
    Expect?: string,
    ACL?: ObjectACL,
    GrantRead?: Grant,
    GrantReadAcp?: Grant,
    GrantWriteAcp?: Grant,
    GrantFullControl?: Grant,
    Query?: string,
    StorageClass?: StorageClass,
    'x-cos-meta-*'?: string,
    onTaskReady?: Function,
    onHashProgress?: onProgress,
    onProgress?: onProgress,
  }
  interface SliceUploadFileResult extends GeneralResult {
    ETag: string,
    Location: string,
    VersionId?: VersionId,
  }

  // abortUploadTask
  interface AbortUploadTaskParams extends GeneralObjectParams {
    Level?: 'task' | 'file' | 'bucket',
    UploadId?: string,
  }
  interface AbortUploadTaskResult extends GeneralResult {}

  // uploadFiles
  type UploadFileItemParams = (PutObjectParams | SliceUploadFileParams) & {
    FilePath: string,
    onProgress?: onProgress,
    onFileFinish?: (err: Error, data?: object) => void,
  }
  interface UploadFileItemResult extends GeneralResult {
    ETag: string,
    Location: string,
    VersionId?: VersionId,
  }
  interface UploadFilesParams {
    files: UploadFileItemParams[],
    SliceSize: number,
    onProgress?: onProgress,
    onFileFinish?: (err: Error, data?: object) => void,
  }
  interface UploadFilesResult extends GeneralResult {
    files: {
      options: UploadFileItemParams, error: Error, data: UploadFileItemResult,
    }[],
  }

  // sliceCopyFile
  interface SliceCopyFileParams extends GeneralObjectParams {
    CopySource: string,
    CopySliceSize?: number,
    CopyChunkSize?: number,
  }
  interface SliceCopyFileResult extends GeneralResult {}

  // getTaskList
  type TaskId = string
  type Task = {
    id: TaskId,
    Bucket: Bucket,
    Region: Region,
    Key: Key,
    FilePath: string,
    state: string,
    error: string,
    loaded: number,
    size: number,
    speed: number,
    percent: number,
    hashPercent: number,
  }
  type TaskList = Task[]

  // getObjectUrl
  interface GetObjectUrlParams extends GeneralObjectParams {
    Sign?: boolean,
    Method: string,
    Query?: Query,
    Expires?: number,
  }
  interface GetObjectUrlResult {
    Url: string
  }

  // getV4Auth
  interface GetV4AuthParams {
    Bucket?: string,
    Key?: string,
    Expires?: number,
    SecretId?: string,
    SecretKey?: string,
  }

  // getAuth
  interface GetAuthParams {
    Method?: string,
    Key?: string,
    Expires?: number,
    Query?: Query,
    Headers?: Headers,
    SecretId?: string,
    SecretKey?: string,
  }

}

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
  getService(params: COS.GetServiceParams, callback: (err: COS.Error, data: COS.GetServiceResult) => void): void;
  getService(params: COS.GetServiceParams): Promise<COS.GetServiceResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   * @returns data.Location             操作地址
   */
  putBucket(params: COS.PutBucketParams, callback: (err: COS.Error, data: COS.PutBucketResult) => void): void;
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
  headBucket(params: COS.HeadBucketParams, callback: (err: COS.Error, data: COS.HeadBucketResult) => void): void;
  headBucket(params: COS.HeadBucketParams): Promise<COS.HeadBucketResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   * @returns data.Contents     返回的 object 列表信息
   * @returns data.CommonPrefixes     返回的公共前缀列表信息，类似当前目录下的子目录列表，如果传入了 Delimiter 就会返回该列表
   * @returns data.NextMarker     继续列出文件的时候要传入的 Marker
   * @returns data.NextVersionIdMarker     继续列出文件的时候要传入的 VersionIdMarker
   */
  getBucket(params: COS.GetBucketParams, callback: (err: COS.Error, data: COS.GetBucketResult) => void): void;
  getBucket(params: COS.GetBucketParams): Promise<COS.GetBucketResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   * @returns data.Contents     返回的 object 列表信息
   * @returns data.CommonPrefixes     返回的公共前缀列表信息，类似当前目录下的子目录列表，如果传入了 Delimiter 就会返回该列表
   * @returns data.IsTruncated     返回的 object 列表信息
   * @returns data.NextMarker     继续列出文件的时候要传入的 Marker
   * @returns data.NextVersionIdMarker     继续列出文件的时候要传入的 VersionIdMarker
   */
  listObjectVersions(params: COS.ListObjectVersionsParams, callback: (err: COS.Error, data: COS.ListObjectVersionsResult) => void): void;
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
  deleteBucket(params: COS.DeleteBucketParams, callback: (err: COS.Error, data: COS.DeleteBucketResult) => void): void;
  deleteBucket(params: COS.DeleteBucketParams): Promise<COS.DeleteBucketResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          返回的数据
   */
  putBucketAcl(params: COS.PutBucketAclParams, callback: (err: COS.Error, data: COS.PutBucketAclResult) => void): void;
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
  getBucketAcl(params: COS.GetBucketAclParams, callback: (err: COS.Error, data: COS.GetBucketAclResult) => void): void;
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
  putBucketCors(params: COS.PutBucketCorsParams, callback: (err: COS.Error, data: COS.PutBucketCorsResult) => void): void;
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
  getBucketCors(params: COS.GetBucketCorsParams, callback: (err: COS.Error, data: COS.PutBucketCorsResult) => void): void;
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
  deleteBucketCors(params: COS.DeleteBucketCorsParams, callback: (err: COS.Error, data: COS.DeleteBucketCorsResult) => void): void;
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
  getBucketLocation(params: COS.GetBucketLocationParams, callback: (err: COS.Error, data: COS.GetBucketLocationResult) => void): void;
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
  putBucketPolicy(params: COS.PutBucketPolicyParams, callback: (err: COS.Error, data: COS.PutBucketPolicyResult) => void): void;
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
  getBucketPolicy(params: COS.GetBucketPolicyParams, callback: (err: COS.Error, data: COS.GetBucketPolicyResult) => void): void;
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
  deleteBucketPolicy(params: COS.DeleteBucketPolicyParams, callback: (err: COS.Error, data: COS.DeleteBucketPolicyResult) => void): void;
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
  putBucketTagging(params: COS.PutBucketTaggingParams, callback: (err: COS.Error, data: COS.PutBucketTaggingResult) => void): void;
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
  getBucketTagging(params: COS.GetBucketTaggingResult, callback: (err: COS.Error, data: COS.GetBucketTaggingResult) => void): void;
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
  deleteBucketTagging(params: COS.DeleteBucketTaggingParams, callback: (err: COS.Error, data: COS.DeleteBucketTaggingResult) => void): void;
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
  putBucketLifecycle(params: COS.PutBucketLifecycleParams, callback: (err: COS.Error, data: COS.PutBucketLifecycleResult) => void): void;
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
  getBucketLifecycle(params: COS.GetBucketLifecycleParams, callback: (err: COS.Error, data: COS.GetBucketLifecycleResult) => void): void;
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
  deleteBucketLifecycle(params: COS.DeleteBucketLifecycleParams, callback: (err: COS.Error, data: COS.DeleteBucketLifecycleResult) => void): void;
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
  putBucketVersioning(params: COS.PutBucketVersioningParams, callback: (err: COS.Error, data: COS.PutBucketVersioningResult) => void): void;
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
  getBucketVersioning(params: COS.GetBucketVersioningParams, callback: (err: COS.Error, data: COS.GetBucketVersioningResult) => void): void;
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
  putBucketReplication(params: COS.PutBucketReplicationParams, callback: (err: COS.Error, data: COS.PutBucketReplicationResult) => void): void;
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
  getBucketReplication(params: COS.GetBucketReplicationParams, callback: (err: COS.Error, data: COS.GetBucketReplicationResult) => void): void;
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
  deleteBucketReplication(params: COS.DeleteBucketReplicationParams, callback: (err: COS.Error, data: COS.DeleteBucketReplicationResult) => void): void;
  deleteBucketReplication(params: COS.DeleteBucketReplicationParams): Promise<COS.DeleteBucketReplicationResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                                  返回数据
   */
  putBucketWebsite(params: COS.PutBucketWebsiteParams, callback: (err: COS.Error, data: COS.PutBucketWebsiteResult) => void): void;
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
  getBucketWebsite(params: COS.GetBucketWebsiteParams, callback: (err: COS.Error, data: COS.GetBucketWebsiteResult) => void): void;
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
  deleteBucketWebsite(params: COS.DeleteBucketWebsiteParams, callback: (err: COS.Error, data: COS.DeleteBucketWebsiteResult) => void): void;
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
   * @param RefererConfiguration.EmptyReferConfiguration 是否允许空 Referer 访问，枚举值：Allow、Deny，默认值为 Deny，非必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                                  返回数据
   */
  putBucketReferer(params: COS.PutBucketRefererParams, callback: (err: COS.Error, data: COS.PutBucketRefererResult) => void): void;
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
  getBucketReferer(params: COS.GetBucketRefererParams, callback: (err: COS.Error, data: COS.GetBucketRefererResult) => void): void;
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
  putBucketDomain(params: COS.PutBucketDomainParams, callback: (err: COS.Error, data: COS.PutBucketDomainResult) => void): void;
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
  getBucketDomain(params: COS.GetBucketDomainParams, callback: (err: COS.Error, data: COS.GetBucketDomainResult) => void): void;
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
  deleteBucketDomain(params: COS.DeleteBucketDomainParams, callback: (err: COS.Error, data: COS.DeleteBucketDomainResult) => void): void;
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
  putBucketOrigin(params: COS.PutBucketOriginParams, callback: (err: COS.Error, data: COS.PutBucketOriginResult) => void): void;
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
  getBucketOrigin(params: COS.GetBucketOriginParams, callback: (err: COS.Error, data: COS.GetBucketOriginResult) => void): void;
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
  deleteBucketOrigin(params: COS.DeleteBucketOriginParams, callback: (err: COS.Error, data: COS.DeleteBucketOriginResult) => void): void;
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
  putBucketLogging(params: COS.PutBucketLoggingParams, callback: (err: COS.Error, data: COS.PutBucketLoggingResult) => void): void;
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
  getBucketLogging(params: COS.GetBucketLoggingParams, callback: (err: COS.Error, data: COS.GetBucketLoggingResult) => void): void;
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
  putBucketInventory(params: COS.PutBucketInventoryParams, callback: (err: COS.Error, data: COS.PutBucketInventoryResult) => void): void;
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
  getBucketInventory(params: COS.GetBucketInventoryParams, callback: (err: COS.Error, data: COS.GetBucketInventoryResult) => void): void;
  getBucketInventory(params: COS.GetBucketInventoryParams): Promise<COS.GetBucketInventoryResult>;

  /**
   * 获取 Bucket 的清单任务信息
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.ContinuationToken - 当 COS 响应体中 IsTruncated 为 true，且 NextContinuationToken 节点中存在参数值时，您可以将这个参数作为 continuation-token 参数值，以获取下一页的清单任务信息，非必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                              返回数据
   */
  listBucketInventory(params: COS.ListBucketInventoryParams, callback: (err: COS.Error, data: COS.ListBucketInventoryResult) => void): void;
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
  deleteBucketInventory(params: COS.DeleteBucketInventoryParams, callback: (err: COS.Error, data: COS.DeleteBucketInventoryResult) => void): void;
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
  putBucketAccelerate(params: COS.PutBucketAccelerateParams, callback: (err: COS.Error, data: COS.PutBucketAccelerateResult) => void): void;
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
  getBucketAccelerate(params: COS.GetBucketAccelerateParams, callback: (err: COS.Error, data: COS.GetBucketAccelerateResult) => void): void;
  getBucketAccelerate(params: COS.GetBucketAccelerateParams): Promise<COS.GetBucketAccelerateResult>;

  /**
   * 取回对应Object的元数据，Head的权限与Get的权限一致
   * @param params - 参数对象，必须
   * @param params.Bucket - Bucket名称，必须
   * @param params.Region - 地域名称，必须
   * @param params.Key - 文件名称，必须
   * @param params.IfModifiedSince - 当Object在指定时间后被修改，则返回对应Object元信息，否则返回304，非必须
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
   * @returns data.NotModified         是否在 IfModifiedSince 时间点之后未修改该 object，则为 true
   */
  headObject(params: COS.HeadObjectParams, callback: (err: COS.Error, data: COS.HeadObjectResult) => void): void;
  headObject(params: COS.HeadObjectParams): Promise<COS.HeadObjectResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
   * @returns data - 为对应的 object 数据，包括 body 和 headers
   */
  getObject(params: COS.GetObjectParams, callback: (err: COS.Error, data: COS.GetObjectResult) => void): void;
  getObject(params: COS.GetObjectParams): Promise<COS.GetObjectResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                          为指定 object 的元数据，如果设置了 IfModifiedSince ，且文件未修改，则返回一个对象，NotModified 属性为 true
   * @returns data - 为对应的 object 数据，包括 body 和 headers
   */
  getObjectStream(params: COS.GetObjectParams, callback?: (err: COS.Error, data: COS.GetObjectResult) => void): Stream;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                           请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                          为对应的 object 数据
   * @returns data.ETag                                 为对应上传文件的 ETag 值
   * @returns data.Location                                 为对应上传文件不带 https:// 的 url 值，例如 testbucket-1250000000.cos.ap-beijing.myqcloud.com/folder/1.jpg
   */
  putObject(params: COS.PutObjectParams, callback: (err: COS.Error, data: COS.PutObjectResult) => void): void;
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
  deleteObject(params: COS.DeleteObjectParams, callback: (err: COS.Error, data: COS.DeleteObjectResult) => void): void;
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
  deleteMultipleObject(params: COS.DeleteMultipleObjectParams, callback: (err: COS.Error, data: COS.DeleteMultipleObjectResult) => void): void;
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
  getObjectAcl(params: COS.GetObjectAclParams, callback: (err: COS.Error, data: COS.GetObjectAclResult) => void): void;
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
  putObjectAcl(params: COS.PutObjectAclParams, callback: (err: COS.Error, data: COS.PutObjectAclResult) => void): void;
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
  optionsObject(params: COS.OptionsObjectParams, callback: (err: COS.Error, data: COS.OptionsObjectResult) => void): void;
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
  restoreObject(params: COS.RestoreObjectParams, callback: (err: COS.Error, data: COS.RestoreObjectResult) => void): void;
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
  selectObjectContent(params: COS.SelectObjectContentParams, callback: (err: COS.Error, data: COS.SelectObjectContentResult) => void): void;
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
  selectObjectContentStream(params: COS.SelectObjectContentParams, callback?: (err: COS.Error, data: COS.SelectObjectContentResult) => void): Stream;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                       请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                      返回的数据
   */
  putObjectCopy(params: COS.PutObjectCopyParams, callback: (err: COS.Error, data: COS.PutObjectCopyResult) => void): void;
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
  putObjectTagging(params: COS.PutObjectTaggingParams, callback: (err: COS.Error, data: COS.PutObjectTaggingResult) => void): void;
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
  getObjectTagging(params: COS.GetObjectTaggingParams, callback: (err: COS.Error, data: COS.GetObjectTaggingResult) => void): void;
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
  deleteObjectTagging(params: COS.DeleteObjectTaggingParams, callback: (err: COS.Error, data: COS.DeleteObjectTaggingResult) => void): void;
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
   * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，非必须
   * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
   * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
   * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
   * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
   * @param params.StorageClass	设置对象的存储级别，枚举值：STANDARD、STANDARD_IA、ARCHIVE，默认值：STANDARD	String	否
   * @param params['x-cos-meta-*']	允许用户自定义的头部信息，将作为对象的元数据返回。大小限制2KB	String	否
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                       请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                      返回的数据
   */
  multipartInit(params: COS.MultipartInitParams, callback: (err: COS.Error, data: COS.MultipartInitResult) => void): void;
  multipartInit(params: COS.MultipartInitParams): Promise<COS.MultipartInitResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                               请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                              返回的数据
   * @returns data.ETag                         返回的文件分块 sha1 值
   */
  multipartUpload(params: COS.MultipartUploadParams, callback: (err: COS.Error, data: COS.MultipartUploadResult) => void): void;
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
  uploadPartCopy(params: COS.UploadPartCopyParams, callback: (err: COS.Error, data: COS.UploadPartCopyResult) => void): void;
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
  multipartComplete(params: COS.MultipartCompleteParams, callback: (err: COS.Error, data: COS.MultipartCompleteResult) => void): void;
  multipartComplete(params: COS.MultipartCompleteParams): Promise<COS.MultipartCompleteResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                  返回的数据
   * @returns data.ListMultipartUploadsResult   分块上传任务信息
   */
  multipartList(params: COS.MultipartListParams, callback: (err: COS.Error, data: COS.MultipartListResult) => void): void;
  multipartList(params: COS.MultipartListParams): Promise<COS.MultipartListResult>;

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
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err                                   请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data                                  返回的数据
   * @returns data.ListMultipartUploadsResult   分块信息
   */
  multipartListPart(params: COS.MultipartListPartParams, callback: (err: COS.Error, data: COS.MultipartListPartResult) => void): void;
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
  multipartAbort(params: COS.MultipartAbortParams, callback: (err: COS.Error, data: COS.MultipartAbortResult) => void): void;
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
   * @param params.ACL - 允许用户自定义文件权限，有效值：private | public-read，非必须
   * @param params.GrantRead - 赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
   * @param params.GrantReadAcp - 赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
   * @param params.GrantWriteAcp - 赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
   * @param params.GrantFullControl - 赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者，非必须
   * @param params.StorageClass	设置对象的存储级别，枚举值：STANDARD、STANDARD_IA、ARCHIVE，默认值：STANDARD	String	否
   * @param params['x-cos-meta-*']	允许用户自定义的头部信息，将作为对象的元数据保存，大小限制2KB	String	否
   * @param params.onTaskReady	上传任务创建时的回调函数，返回一个 taskId，唯一标识上传任务，可用于上传任务的取消（cancelTask），停止（pauseTask）和重新开始（restartTask）	Function	否
   * @param params.onProgress	进度的回调函数，进度回调响应对象（progressData）属性如下	Function	否
   * @param callback - 回调函数，如果不传会返回 Promise 实例，可选
   * @returns err             请求失败的错误，如果请求成功，则为空。https://cloud.tencent.com/document/product/436/7730
   * @returns data            返回的数据
   */
  sliceUploadFile(params: COS.SliceUploadFileParams, callback: (err: COS.Error, data: COS.SliceUploadFileResult) => void): void;
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
  abortUploadTask(params: COS.AbortUploadTaskParams, callback: (err: COS.Error, data: COS.AbortUploadTaskResult) => void): void;
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
  uploadFiles(params: COS.UploadFilesParams, callback: (err: COS.Error, data: COS.UploadFilesResult) => void): void;
  uploadFiles(params: COS.UploadFilesParams): Promise<COS.UploadFilesResult>;

  /**
   * 分片复制文件
   * @returns taskList  返回上传任务列表
   */
  sliceCopyFile(params: COS.SliceCopyFileParams, callback: (err: COS.Error, data: COS.SliceCopyFileResult) => void): void;
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
  getObjectUrl(params: COS.GetObjectUrlParams, callback: (err: COS.Error, data: COS.GetObjectUrlResult) => void): void;
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
  getV4Auth(params: COS.GetV4AuthParams): string;

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
  getAuth(params: COS.GetAuthParams): string;

}

export = COS;
