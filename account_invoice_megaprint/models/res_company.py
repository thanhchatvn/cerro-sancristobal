# -*- coding: utf-8 -*-

from odoo import fields, models
import requests
import json
import dateutil.parser
from odoo.exceptions import UserError
from xml.etree.ElementTree import Element, SubElement, Comment, tostring, fromstring
from xml.dom import minidom

class ResCompany(models.Model):
    _inherit = 'res.company'

    regimen_iva = fields.Char(string='Regimen asociado de IVA', help='Regimen asociado de IVA en Guatemala. Iniciales necearias para comunicacion con FEL. En caso de duda, referirse a documentacion oficial de la Superintendencia de Administracion Tributaria.')
    nombre_comercial = fields.Char(string='Nombre Comercial', help='Indica el nombre comercial del establecimiento (de acuerdo a los registros tributarios) donde se emite el documento.')
    username = fields.Char('Usuario')
    password = fields.Char('Clave')
    token_access = fields.Text('Token')
    date_due = fields.Date('Expira')
    company_nit = fields.Char('Nit Autorizado')
    url_token = fields.Text('Url Token', default="https://dev.api.ifacere-fel.com/fel-dte-services/api/solicitarToken")
    url_request_signature = fields.Text('Url Solicitar firma', default="https://dev.api.soluciones-mega.com/api/solicitaFirma")
    url_request = fields.Text('Url Firmado', default="https://dev2.api.ifacere-fel.com/api/registrarDocumentoXML")
    url_cancel = fields.Text('Url Anulacion', default="https://dev.api.ifacere-fel.com/fel-dte-services/api/anularDocumentoXML")
    url_pdf = fields.Text('Url PDf', default="https://dev.api.ifacere-fel.com/fel-dte-services/api/retornarPDF")
    url_customer = fields.Text('Url DatosCliente', default="https://dev.api.ifacere-fel.com/fel-dte-services/api/retornarDatosCliente")
    frase_ids = fields.Many2many('satdte.frases', 'company_frases_rel', 'company_id', 'frases_id', 'Frases')

    def action_get_token(self):
        for rec in self:
            post_url = rec.url_token
            headers = {
                "Content-type": "application/xml"
            }
            if not rec.vat:
                raise UserError(('La empresa %s no tiene numero de NIT parametrizado') %(rec.name))
            xml = self.request_token_xml(rec.username, rec.password)
            try:
                response  = requests.post(post_url, data=xml, headers=headers, stream=True, verify=False)
                if response.status_code == 200:
                    self.xml_validation(response.content.decode('utf-8'))
                    xml_res = self.get_xml_dict(response.content.decode('utf-8'))
                    rec.write({
                        'token_access': xml_res['token'],
                        'date_due': xml_res['vigencia'],
                    })
            except Exception as e:
                raise UserError(('%s') %(e))
        return True
    
    def request_token_xml(self, user, password):
        xml = ""
        pretty_str = ""
        if not user or not password:
            raise UserError(('No se ha configurado Usuario/Clave en la empresa %s') %(self.name))
        try:
            SolicitaTokenRequest = Element('SolicitaTokenRequest')
            User = SubElement(SolicitaTokenRequest, 'usuario')
            User.text = str(user)
            Apikey = SubElement(SolicitaTokenRequest, 'apikey')
            Apikey.text = str(password)
            xml = tostring(SolicitaTokenRequest, encoding='utf-8', method='xml')
            reparsed = minidom.parseString(xml)
            pretty_str = reparsed.toprettyxml(indent="  ", encoding="utf-8")
        except Exception as e:
            raise UserError(("%s") %(e))
        finally:
            return pretty_str
    
    def get_xml_dict(self, xml_reponse):
        dict_res = {}
        if xml_reponse:
            xml = fromstring(xml_reponse)
            for child in xml:
                if child.tag ==  'tipo_respuesta':
                    dict_res.update({'tipo_respuesta': child.text})
                elif child.tag == 'token':
                    dict_res.update({'token': child.text})
                elif child.tag == 'vigencia':
                    dict_res.update({'vigencia': child.text})
        return dict_res

    def xml_validation(self, xml_str):
        lst_errores = ""
        lst_tags = ""
        if xml_str:
            tree = fromstring(xml_str)
            for child in tree:
                if child.tag == 'tipo_respuesta':
                    if child.text != '0':
                        for subchild in tree:
                            if subchild.tag == 'listado_errores':
                                for error in subchild:
                                    for suberror in error:
                                       lst_errores += "%s %s \n" %(suberror.tag, suberror.text)
                                raise UserError(('%s') %(lst_errores))
            return True


ResCompany()
