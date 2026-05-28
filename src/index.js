export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      return env.ASSETS.fetch(request);
    }
    
    return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
  }
}
