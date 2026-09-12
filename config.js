const CONFIG = {
  // S3 Bucket Configuration
  s3BucketName: 'anandify', // Put your S3 bucket name here (e.g. 'my-bday-bucket')
  region: 'ap-south-1',

  // Image format extension ('webp', 'png', etc.)
  extension: 'webp',

  // Audio MP3 Filenames (loaded from S3 bucket root or custom baseUrl)
  sound1: 'sound1.mp3', // Played when sequence starts
  sound2: 'sound2.mp3', // Played when final reveal happens
  backgroundMusicStart: 'bg01.mp3',
  backgroundMusicReveal: 'bg02.mp3',

  /**
   * Helper function to return the full URL for a scene frame ID.
   * Single source of truth for all scene image assets across the application.
   */
  getSceneUrl(id) {
    if (this.baseUrl) {
      const cleanBase = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
      return `${cleanBase}scene/${id}.${this.extension}`;
    }
    if (this.s3BucketName && this.s3BucketName !== 'YOUR_BUCKET_NAME') {
      return `https://${this.s3BucketName}.s3.${this.region}.amazonaws.com/scene/${id}.${this.extension}`;
    }
    return `scene/${id}.${this.extension}`;
  },

  /**
   * Helper function to return the full URL for an audio MP3 track.
   * @param {string} filename 
   * @returns {string}
   */
  getAudioUrl(filename) {
    if (this.baseUrl) {
      const cleanBase = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
      return `${cleanBase}${filename}`;
    }
    if (this.s3BucketName && this.s3BucketName !== 'YOUR_BUCKET_NAME') {
      return `https://${this.s3BucketName}.s3.${this.region}.amazonaws.com/${filename}`;
    }
    return `${filename}`;
  },

  /**
   * Helper function to return the full URL for scene music tracks (1..8).
   * @param {number|string} id 
   * @returns {string}
   */
  getMusicUrl(id) {
    if (this.baseUrl) {
      const cleanBase = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
      return `${cleanBase}scene/music/${id}.mp3`;
    }
    if (this.s3BucketName && this.s3BucketName !== 'YOUR_BUCKET_NAME') {
      return `https://${this.s3BucketName}.s3.${this.region}.amazonaws.com/scene/music/${id}.mp3`;
    }
    return `scene/music/${id}.mp3`;
  },

  /**
   * Helper function for the two continuous background songs.
   * @param {string} filename
   * @returns {string}
   */
  getBackgroundMusicUrl(filename) {
    if (this.baseUrl) {
      const cleanBase = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
      return `${cleanBase}scene/music/${filename}`;
    }
    if (this.s3BucketName && this.s3BucketName !== 'YOUR_BUCKET_NAME') {
      return `https://${this.s3BucketName}.s3.${this.region}.amazonaws.com/scene/music/${filename}`;
    }
    return `scene/music/${filename}`;
  }
};
