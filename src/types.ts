/**
 * weixin 配置类型
 */
export interface WeixinConfig {
  accountId: string;
}

/**
 * 解析后的 微信 账户
 */
export interface ResolvedWeixinAccount {
  enabled: boolean;
  accountId: string;
  allowFrom: [];
}

/**
 * weixin 账户配置
 */
export interface WeixinAccountConfig {
  enabled: boolean;
  allowFrom?: [];
}

/**
 * weixin 默认账户配置
 */
export interface WeixinDefaultAccountConfig extends WeixinAccountConfig{
  accountId: string;
}

/**
 * weixin 频道配置
 */
export interface WeixinChannelConfig {
  gateway: string;
  default?: WeixinDefaultAccountConfig;
  accounts?: Record<string, WeixinAccountConfig>;
}

export interface WeixinUserProfile{
  userName: string,
  nickName: string,
  remark?: string,
  alias?: string,
  smallHeadImgUrl?: string;
  sex?: number;
  signature?: string;
  natiton?: string;
  province?: string;
  city?: string;
}

export interface WeixinChatRoomUserProfile extends WeixinUserProfile{
  displayNickName?: string;
  isChatRoomAdmin?: boolean;
  isChatRoomOwner?: boolean;
}

export interface WeixinMessage{
  accountId: string;
  type: number;
  from: string;
  to: string;
  content: string;
  msgSvrId: number;
  szMsgSvrId: string;
  createTime: number;
  talkerInfo: WeixinUserProfile;
  replyUrl: string;
  isChatRoomMsg: number;
  realUserName: string;
  chatRoomMemberInfo?: WeixinChatRoomUserProfile;
  attachments?: string[];
}

export interface WeixinReferenceMessage{
  msgType: number;
  content: string;
  msgSvrId: number | string;
  createTime: number;
  userName: string;
}