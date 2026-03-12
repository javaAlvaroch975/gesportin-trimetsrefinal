package net.ausiasmarch.gesportin.filter;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import net.ausiasmarch.gesportin.exception.UnauthorizedException;
import net.ausiasmarch.gesportin.service.SessionService;

@Aspect
@Component
public class AdminCrudGuardAspect {

    @Autowired
    private SessionService oSessionService;

    @Before("(" +
            "execution(public * net.ausiasmarch.gesportin.service..*.get(..)) || " +
            "execution(public * net.ausiasmarch.gesportin.service..*.getPage(..)) || " +
            "execution(public * net.ausiasmarch.gesportin.service..*.create(..)) || " +
            "execution(public * net.ausiasmarch.gesportin.service..*.update(..)) || " +
            "execution(public * net.ausiasmarch.gesportin.service..*.delete(..)) || " +
            "execution(public * net.ausiasmarch.gesportin.service..*.count(..)) || " +
            "execution(public * net.ausiasmarch.gesportin.service..*.fill(..)) || " +
            "execution(public * net.ausiasmarch.gesportin.service..*.empty(..))" +
            ") && !within(net.ausiasmarch.gesportin.service.SessionService)")
    public void requireAdminForCrud() {
        // both super‑admins and team‑admins are allowed to invoke service CRUD methods;
        // individual services will further restrict what team‑admins can do/see
        if (!oSessionService.isAdmin() && !oSessionService.isEquipoAdmin()) {
            throw new UnauthorizedException("Acceso denegado: solo los administradores pueden realizar operaciones CRUD");
        }
    }
}
