import axios from "axios"

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on the server
    // requests should be made to ingress controller
    const k8sServiceName = 'ingress-nginx-controller'
    const k8sNamespace = 'ingress-nginx'
    return axios.create({
      baseURL: `http://${k8sServiceName}.${k8sNamespace}.svc.cluster.local`,
      headers: req.headers
    });
  } else {
    // we are in the browser
    return axios.create({
      baseURL: '/'
    });
  }
}

export default buildClient;