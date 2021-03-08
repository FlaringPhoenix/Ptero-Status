declare module 'pterostatus' {
  import { Message, Client } from 'discord.js';
  import { Express } from 'express';
  import { Systeminformation } from 'systeminformation';

  export class Panel {
    constructor(
      port?: number,
      options?: {
        token?: string;
        guildID?: string;
        channelID?: string;
        interval?: number;
        node?: {
          message?: string;
          online?: string;
          offline?: string;
        };
        embed?: {
          color?: string;
          title?: string;
          description?: string;
        };
        pterodactyl?: {
          panel?: string;
          apiKey?: string;
        };
      }
    );

    public online: string;
    public offline: string;
    public nodeMessage: string;
    public color: string;
    public title: string;
    public description: string;
    public panel: string;
    public client: Client;
    public pterodactyl: Pterodactyl;
    /**
     * Should be keept private
     */
    public apiKey: string;
    private app: Express;

    public startBot(token: string, interval: number): void;
    public startPterodactyl(panel: string, apiKey: string, interval: number): void;
    public updateEmbed(): Promise<void>;
    public editEmbed(channel: string, message: string, title: string, description: string, fields: string, footer: string, color: string, thumbnail: string): Promise<Message>;
    public bytesToSize(bytes: number): string;
    private log(message: any): void;
  }

  export class Pterodactyl {
    constructor(panelURL: string, apiKey: string, interval: number);

    public panelURL: string;
    /**
     * Should be keept private
     */
    public apiKey: string;
    public interval: number;

    private init(intervale?: number): void;
    public getServerCount(): string;
    public getUserCount(): string;
    public updateServerCount(): Promise<string | void>;
    public updateUserCount(): Promise<string | void>;
    private log(message: any): void;
  }

  export class Daemon {
    constructor(
      name: string,
      cache?: number,
      options?: {
        ip: string;
        port: string;
        secure?: boolean;
      }
    );

    public name: string;
    public cache: number;

    public initCache(): Promise<void>;
    public postStats(): Promise<void>;
    public stats(): Promise<Stats>;
  }

  export interface Stats {
    nodeName: string;
    lastUpdated: number;
    cacheInterval: number;
    stats: {
      memory: {
        total: number;
        used: number;
        free: number;
      };
      disk: {
        total: number;
        used: number;
        free: number;
      };
      cpu: Systeminformation.CpuData;
      network: Systeminformation.NetworkStatsData[];
      os: Systeminformation.OsData;
      bios: Systeminformation.BiosData;
      docker: {
        running: boolean;
        paused: boolean;
        stopped: boolean;
      };
      cl: Systeminformation.CurrentLoadData;
    };
  }
}
