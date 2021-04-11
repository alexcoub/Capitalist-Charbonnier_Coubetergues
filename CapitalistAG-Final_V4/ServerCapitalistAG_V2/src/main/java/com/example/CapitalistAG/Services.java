package com.example.CapitalistAG;

import com.example.CapitalistAG.generated.PallierType;
import com.example.CapitalistAG.generated.ProductType;
import com.example.CapitalistAG.generated.TyperatioType;
import com.example.CapitalistAG.generated.World;

import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import java.io.File;
import java.io.InputStream;

public class Services {
    World p = new World();
    InputStream input = getClass().getClassLoader().getResourceAsStream("world");


    public World readWorldFromXml(String user) throws JAXBException {

        JAXBContext cont;

        try {
            File file = new File(user  + "world.xml");

            cont = JAXBContext.newInstance(World.class);
            Unmarshaller u = cont.createUnmarshaller();
            p = (World) u.unmarshal(file);

            System.out.println("opening file : " + file.getAbsolutePath());
            return p;

        } catch (JAXBException e) {
            cont = JAXBContext.newInstance(World.class);
            Unmarshaller u = cont.createUnmarshaller();
            p = (World) u.unmarshal(input);
            System.out.println("Bienvenue au nouveau joueur : " + user);
            return p;
        }
    }


    public void saveWordlToXml(World world, String user){

        JAXBContext cont;

        try {
            File file = new File(user + "-" + "world.xml");

            cont = JAXBContext.newInstance(World.class);
            Marshaller m = cont.createMarshaller();

            m.marshal(world, file);
        }
        catch (JAXBException e) {
        }
    }
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public World getWorld(String user) throws JAXBException {
        World w=readWorldFromXml(user);
        long now=System.currentTimeMillis();
        long last=w.getLastupdate();
        if(now==last){return w;}
        else{
          
            w.setLastupdate(now);
            saveWordlToXml(w,user);
            return w;
        }

    }

    public void deleteWorld(String user) throws JAXBException{
        World w1= readWorldFromXml(user);
        double angeA= w1.getActiveangels();
        double totalAnge=w1.getTotalangels();
        double score=w1.getScore();

        double ajout=Math.round(150 * Math.sqrt((w1.getScore()) / Math.pow(10, 15))) - totalAnge;

        angeA+=ajout;
        totalAnge+=ajout;

        InputStream input =getClass().getClassLoader().getResourceAsStream("world.xml");
        JAXBContext cont = JAXBContext.newInstance(World.class);
        Unmarshaller u = cont.createUnmarshaller();
        World w = (World) u.unmarshal(input);

        w.setActiveangels(angeA);
        w.setTotalangels(totalAnge);
        w.setScore(score);

        saveWordlToXml(w,user);
    }


    public boolean updateProduct(String user, ProductType prod) throws JAXBException {
        World w =getWorld(user);
        double cout;
        ProductType product = findProductById(w,prod.getId());
        if(product==null){
            return false;
        }
        int qtchange = prod.getQuantite()-product.getQuantite();
        if (qtchange>0){
            cout = (product.getCout()*(1-Math.pow(product.getCroissance(), product.getQuantite())))/(1-product.getCroissance());
            w.setMoney(w.getMoney()-cout);
            product.setQuantite(prod.getQuantite());
        }
        else{
            product.setTimeleft(product.getVitesse());
        }
        for(PallierType k:product.getPalliers().getPallier()){
            if (!k.isUnlocked() && product.getQuantite()>= k.getSeuil()){
                k.setUnlocked(true);

                if(k.getTyperatio()==TyperatioType.VITESSE){
                    product.setVitesse((int)(product.getVitesse()*k.getRatio()));
                }
                else{
                    product.setRevenu(product.getRevenu()*k.getRatio());
                }

            }
        }
        saveWordlToXml(w,user);
        return true;
    }
    public boolean updateManager(String user, PallierType newmanager) throws JAXBException {
        World w = getWorld(user);
        PallierType man=findManagerByName(w,newmanager.getName());
        if (man==null){return false;}
        man.setUnlocked(true);
        ProductType product =findProductById(w,man.getIdcible());
        if (product==null){return false;}
        product.setManagerUnlocked(true);
        w.setMoney(w.getMoney()-man.getSeuil());
        w.setLastupdate(System.currentTimeMillis());
        saveWordlToXml(w,user);
        return true;
    }

    private ProductType findProductById(World world, int id) {
        ProductType prod = null;
        for (ProductType p : world.getProducts().getProduct()) {
            if (p.getId() == id) {
                prod = p;
            }
        }
        return prod;
    }
    private PallierType findManagerByName(World world, String name) {
        PallierType pall = null;
        for (PallierType p : world.getManagers().getPallier()) {
            if (p.getName()== name) {
                pall = p;
            }
        }
        return pall;
    }

    public boolean updateUpgrades(String user, PallierType upgrade) throws JAXBException {
        World w =getWorld(user);
        if(upgrade.getIdcible()==0){
            boolean t=true;
            for(ProductType p : w.getProducts().getProduct()){
                if(p.getQuantite()<upgrade.getSeuil()){
                    t=false;
                }
            }
            if(t){
                for(ProductType p : w.getProducts().getProduct()){
                    updatePallier(upgrade,p);
                }

            }

        }
        else{
            ProductType p = findProductById(w, upgrade.getIdcible());
            if(p.getQuantite()>upgrade.getSeuil()){
                updatePallier(upgrade, p);
                return true;
            }

        }
        return false;
    }

    public void updatePallier(PallierType upgrade, ProductType prod){
        upgrade.setUnlocked(true);
        if(upgrade.getTyperatio() == TyperatioType.VITESSE){
            double vitesses= prod.getVitesse();

            prod.setVitesse((int)(vitesses*upgrade.getRatio()));
        }
        if(upgrade.getTyperatio()==TyperatioType.GAIN){
            double revenus=prod.getRevenu();

            prod.setRevenu(revenus*upgrade.getRatio());
        }
    }

    public void angelUpgrade(String username, PallierType ange) throws JAXBException {
        int a = ange.getSeuil();
        World world = getWorld(username);
        double angeActif = world.getActiveangels();
        double newAngeActif = angeActif - a;
        if (ange.getTyperatio() == TyperatioType.ANGE) {
            double angeBonus = world.getAngelbonus();
            angeBonus += angeBonus + ange.getRatio();
            world.setAngelbonus((int) angeBonus);
        } else {
            updateUpgrades(username, ange);
        }
        world.setActiveangels(newAngeActif);
    }
}
