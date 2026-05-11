import path from 'path';
import fs from 'fs';
import Discord from 'discord.js';
import {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel,
    type AudioPlayer,
    type VoiceConnection,
} from '@discordjs/voice';
import { Client } from '@/base/client';
import Logger from '@/base/logger';
import { settings } from '@/config/settings';

Logger.header('Discord Welcome Bot');
Logger.log(`Bot Girişi: ${settings.Welcome.token.length}`);
Logger.line();

for (let i = 0; i < settings.Welcome.token.length; i++) {
    const client = new Client();
    const channelId = settings.Welcome.voice[i] ?? settings.Welcome.voice[0];
    const token = settings.Welcome.token[i];
    const logLabel = `Welcome-${i}`;
    const staffRoleIds = settings.Welcome.staff;
    const unregRoleIds = settings.Welcome.unregister;

    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
    player.on('error', (err) => Logger.error(`[${logLabel}] AudioPlayer`, { error: err }));

    let connection: VoiceConnection | null = null;
    let staffInChannel = false;

    const isStaff = (member: Discord.GuildMember) => {
        if (member.user.bot) return false;
        if (member.permissions.has(Discord.PermissionFlagsBits.Administrator)) return true;
        return staffRoleIds.some((id) => member.roles.cache.has(id));
    };

    const isUnreg = (member: Discord.GuildMember) => {
        if (member.user.bot) return false;
        if (unregRoleIds.length === 0) return !isStaff(member);
        return unregRoleIds.some((id) => member.roles.cache.has(id));
    };

    const connect = () => {
        const guild = client.guilds.cache.get(settings.Welcome.guildID);
        if (!guild) throw new Error('Sunucu bulunamadı');
        const ch = guild.channels.cache.get(channelId) as Discord.VoiceChannel;
        if (!ch) throw new Error('Ses kanalı bulunamadı');

        if (connection) connection.removeAllListeners('error');

        connection = joinVoiceChannel({
            channelId: ch.id,
            guildId: ch.guild.id,
            adapterCreator: ch.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
            group: client.user!.id,
        });

        connection.on('error', (err) => Logger.warn(`[${logLabel}] Ses bağlantısı`, { error: err }));
        return connection;
    };

    const playWelcome = async () => {
        if (!connection) return;
        if (connection.state.status !== VoiceConnectionStatus.Ready) {
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            } catch {
                return;
            }
        }

        player.removeAllListeners(AudioPlayerStatus.Idle);
        player.stop(true);

        const mp3 = path.join(__dirname, '../music/hosgeldin.mp3');

        const loop = async () => {
            if (staffInChannel) return;
            if (!fs.existsSync(mp3)) return;
            try {
                player.play(createAudioResource(mp3));
                connection!.subscribe(player);
                player.once(AudioPlayerStatus.Idle, () => {
                    if (!staffInChannel) void loop();
                });
            } catch (err) {
                Logger.error(`[${logLabel}] Hoş geldin oynatma`, { error: err });
            }
        };

        await loop();
    };

    const playStaff = async () => {
        if (!connection) return;
        if (connection.state.status !== VoiceConnectionStatus.Ready) {
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
            } catch {
                return;
            }
        }

        player.removeAllListeners(AudioPlayerStatus.Idle);
        player.stop(true);

        const mp3 = path.join(__dirname, '../music/yetkili.mp3');
        if (!fs.existsSync(mp3)) return;

        player.play(createAudioResource(mp3));
        connection.subscribe(player);
        player.once(AudioPlayerStatus.Idle, () => {
            player.removeAllListeners(AudioPlayerStatus.Idle);
            player.stop(true);
        });
    };

    client.once(Discord.Events.ClientReady, async () => {
        try {
            const guild = client.guilds.cache.get(settings.Welcome.guildID);
            if (!guild) {
                Logger.error(`[${logLabel}] Sunucu bulunamadı`);
                return;
            }
            await guild.channels.fetch();

            const voiceChannel = guild.channels.cache.get(channelId) as Discord.VoiceChannel | undefined;
            if (!voiceChannel) {
                Logger.error(`[${logLabel}] Ses kanalı bulunamadı`);
                return;
            }

            const conn = connect();
            try {
                await entersState(conn, VoiceConnectionStatus.Ready, 15_000);
                staffInChannel = voiceChannel.members.some((m) => isStaff(m));
            } catch {}

            Logger.success(`[${logLabel}] ${voiceChannel.name} ses kanalına bağlandı.`);
            Logger.line();

            setInterval(() => {
                try {
                    const ch = client.guilds.cache.get(settings.Welcome.guildID)?.channels.cache.get(channelId) as
                        | Discord.VoiceChannel
                        | undefined;
                    if (!ch) return;
                    const newConn = joinVoiceChannel({
                        channelId: ch.id,
                        guildId: ch.guild.id,
                        adapterCreator: ch.guild.voiceAdapterCreator,
                        selfDeaf: false,
                        selfMute: false,
                        group: client.user!.id,
                    });
                    if (newConn !== connection) {
                        connection?.removeAllListeners('error');
                        connection = newConn;
                        connection.on('error', (err) => Logger.warn(`[${logLabel}] Ses bağlantısı`, { error: err }));
                    }
                } catch (err) {
                    Logger.error(`[${logLabel}] ConnectionWatcher`, { error: err });
                }
            }, 5000);

            const hasUnreg = voiceChannel.members.some((m) => isUnreg(m));
            if (staffInChannel && hasUnreg) await playStaff();
            else if (!staffInChannel && hasUnreg) await playWelcome();
        } catch (err) {
            Logger.error(`[${logLabel}] ClientReady`, { error: err });
        }
    });

    client.on(Discord.Events.VoiceStateUpdate, async (oldState, newState) => {
        try {
            if (oldState.member?.id === client.user?.id && oldState.channelId && !newState.channelId) {
                try {
                    connect();
                } catch (err) {
                    Logger.error(`[${logLabel}] Yeniden bağlanma`, { error: err });
                }
                return;
            }

            const voiceChannel = client.guilds.cache.get(settings.Welcome.guildID)?.channels.cache.get(channelId) as
                | Discord.VoiceChannel
                | undefined;
            if (!voiceChannel) return;

            const member = newState.member ?? oldState.member;
            if (!member || member.user.bot) return;

            const joined = newState.channelId === channelId && oldState.channelId !== channelId;
            const left = oldState.channelId === channelId && newState.channelId !== channelId;

            if (joined) {
                if (isStaff(member)) {
                    staffInChannel = true;
                    if (voiceChannel.members.some((m) => isUnreg(m))) await playStaff();
                    else {
                        player.removeAllListeners(AudioPlayerStatus.Idle);
                        player.stop(true);
                    }
                    return;
                }
                if (isUnreg(member) && !staffInChannel) await playWelcome();
                return;
            }

            if (left && isStaff(member)) {
                staffInChannel = voiceChannel.members.some((m) => isStaff(m));
                if (!staffInChannel) {
                    player.removeAllListeners(AudioPlayerStatus.Idle);
                    player.stop(true);
                    if (voiceChannel.members.some((m) => isUnreg(m))) await playWelcome();
                }
            }
        } catch (err) {
            Logger.error(`[${logLabel}] VoiceStateUpdate`, { error: err });
        }
    });

    void Client.BotLogin(token, client, logLabel);
}
