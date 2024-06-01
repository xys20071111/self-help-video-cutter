/*
#EXTM3U
#EXT-X-VERSION:7
#EXT-X-START:TIME-OFFSET=0
#EXT-X-MEDIA-SEQUENCE:39156177
#EXT-X-TARGETDURATION:1
#EXT-X-MAP:URI="h1680092604.m4s"
#EXTINF:1.00,422ce|b020c7c5
39156177.m4s
#EXTINF:1.00,25487|c317aef6
39156178.m4s
#EXTINF:1.00,166bc|f4f85984
39156179.m4s
#EXTINF:1.00,3662d|39caabde
39156180.m4s
#EXTINF:1.00,1709e|bc7f3592
39156181.m4s
#EXTINF:1.00,1ed17|934d6173
39156182.m4s
#EXTINF:1.00,3d2a6|a87f7462
39156183.m4s
#EXTINF:1.00,17eb1|4620a899
39156184.m4s
#EXTINF:1.00,1f304|4f0c63bd
39156185.m4s
*/

interface IClip {
    info: {
        length: number,
        hash: string
    }
    filename: string
}

interface IPlaylist {
    mapFile: string
    clips: Array<IClip>
}

export class InvalidM3u8Error extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'InvalidM3u8Error'
    }
}

export class BliveM3u8Parser {
    public static parse(m3u8String: string): IPlaylist {
        try {
            if ('#EXTM3U' !== m3u8String.slice(0, 7)) {
                throw new InvalidM3u8Error('Invalid m3u8 playlist')
            }
            const lines = m3u8String.split('\n')
            const mapFile: string = (() => {
                for (const line of lines) {
                    if (line.includes('EXT-X-MAP')) {
                        return line.slice(16).replace('"', '')
                    }
                }
                return ''
            })()
            const clips: Array<IClip> = []
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('#EXTINF')) {
                    const info = lines[i].slice(8).split(',')
                    const clip: IClip = {
                        info: {
                            length: parseFloat(info[0]),
                            hash: info[1]
                        },
                        filename: lines[i + 1]
                    }
                    clips.push(clip)
                }
            }
            return {
                mapFile,
                clips
            }
        } catch (e) {
            console.log(e)
            console.log(m3u8String)
            throw new InvalidM3u8Error('Invalid m3u8 playlist')
        }
    }
}