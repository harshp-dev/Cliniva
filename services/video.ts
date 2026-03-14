import twilio from "twilio";

export function generateVideoToken(identity: string, roomName: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;

  if (!accountSid || !apiKey || !apiSecret) {
    throw new Error("Twilio credentials are not configured");
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;

  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity,
    ttl: 60 * 60
  });

  token.addGrant(new VideoGrant({ room: roomName }));

  return token.toJwt();
}
